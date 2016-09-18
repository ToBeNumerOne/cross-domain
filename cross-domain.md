# 浏览器的同源策略
同源策略（Same origin policy）是一种约定，它是浏览器最核心也最基本的安全功能，如果缺少了同源策略，则浏览器的正常功能可能都会受到影响。可以说Web是构建在同源策略基础之上的，浏览器只是针对同源策略的一种实现。

同源策略，它是由Netscape提出的一个著名的安全策略。现在所有支持JavaScript 的浏览器都会使用这个策略。所谓同源是指，域名，协议，端口相同。例如当一个浏览器的两个tab页中分别打开来搜狐和搜狗的页面。当浏览器的搜狐tab页执行一个脚本的时候会检查这个脚本是属于哪个页面的，即检查是否同源，只有和搜狐同源的脚本才会被执行。

# 同源策略的重要性
将一个学校内的学生看作不同源的个体。虽然一个班级里面有许多学生，但是他们都是互不相关的个体。学生家长请求老师提供同学们的学习成绩报告，老师会告诉家长，你只能够查看自家孩子的学习成绩报告。同理，学校收到请求要对一个学生的学习成绩进行评价，那么在出具评价报告之前，学校需要对请求者的身份进行确认。这就是与浏览器密切相关的同源策略。继续假设，学校允许任何人不经过身份确认查看学生的学习成绩报告，这就和浏览器没有同源策略一样。

同源策略机制为现代广泛依赖于cookie维护用户会话的Web浏览器定义了一个特殊的功能，严格隔离不相关的网站提供的内容，防止客户端数据机密性或完整性丢失。

# 开发过程中跨域的必要性
相信开发人员在开发过程中，根据项目的业务需求，也遇到过必须跨域的场景。如a.test.com和b.test.com，两个域根据同源策略是属于不同源的，但是必须进行数据交互，那就涉及到接下来我们要讲的跨域技术。

# 跨域请求的重要注意点
**跨域请求并非是浏览器限制了发起跨站请求，而是请求可以正常发起，到达服务器端，但是服务器返回的结果会被浏览器拦截。**

# 实现跨域请求的方法
## document.domain + iframe的方式
此种方式适用于a.test.com和b.test.com子域不同的方式。其原理简单来说：a域向b域发起请求，使用属于b域的一个页面(middle.html)当做中间人，在middle中向b发起同域的请求，同时执行a域下定义的js方法。a域的页面通过iframe引用middle.html。a域页面需要通过````window.frames['xxx'].contentWindow.xxx()````使用middle.html中定义的方法，所以需要使用````document.domain````的方式提升a子域和middle.html到根域。

具体看代码：

a域中的页面代码：

````
function subDomain() {
    document.domain = 'test.com'; // 提升域
    window.frames['bfrm'].contentWindow.doAjax(function(data) {
      alert(data);
    });
}
````

middle.html中的代码：

````
document.domain = 'test.com';
function xxx(callback) {
  $.ajax('/test').done(function(data) {
    callback(data);
  });
}
````

## JSONP的方式
其原理是根据XmlHttpRequest对象受到同源策略的影响，而\<script\>标签元素却不受同源策略影响，可以加载跨域服务器上的脚本。用JSONP获取的不是JSON数据，而是可以直接运行的JavaScript语句。

**JSONP的方式不受浏览器兼容性的限制。**

**JSONP只支持GET方式的请求。**

JSONP本质上是利用\<script\>标签的跨域能力实现跨域数据的访问，请求动态生成的JavaScript脚本同时，携带一个以callback（**该字段名必须前后台提前协商好，可以是其他名称**）为字段名的函数。其中callback字段的函数是本地的JavaScript函数，服务器端动态产生数据，并在代码中以产生的数据为参数调用 callback字段的函数。当这段脚本加载到本地文档时，callback字段的函数就会被调用。具体核心代码如下：

### JSONP原理的实现
前端核心代码如下：

````
// JSONP 方法的封装
  function jsonp(url, data, callback) {
    // 动态生成script标签
    var script = document.createElement('script');
    document.body.appendChild(script);
    // 此处注意,这个callback的属性名前后端必须得事先协调一致
    data = data || {};
    // 设置函数字段
    // 中间加入时间戳,方式cache
    // ********  注意  *********
    // 此处的callback属性可以是其他名称,前后端必须事先商量好
    data.callback = 'jsonp' + new Date().getTime();
    // 将本地函数绑定到全局,这样后台返回的代码可以直接执行
    window[data.callback] = callback;
    // 使用jquery的$.param序列化query
    url += '?' + $.param(data);
    script.src = url;
    // 加载完成,删除script标签
    script.onload = function () {
      document.body.removeChild(script);
    }
  }
````

后台核心代码如下：

````
router.all('/testjsonp', function(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(req.query.callback + '(' + JSON.stringify({a:123, b:234}) + ')');
});
````

### jQuery对JSONP的支持
其实jquery本身有着对于JSONP的良好支持。jQuery本身封装着$.getJSON()和$.ajax()方法。具体事例代码如下：

* $.getJSON的方法

此处需要注意的是在URL中，必须要有````?callback=?````的参数，只有设置该参数才是以JSONP的方式发送请求。否则会当做是普通的ajax请求。

````
function useGetJSON() {
    $.getJSON('http://b.test.com:8081/testjsonp?callback=?', {test: 'ok'}, function(data) {
      console.log(data);
    });
}
````

* $.ajax指定dataType的方法

此处需要注意的是在URL中，必须要有````?callback=?````的参数，只有设置该参数才是以JSONP的方式发送请求。否则会当做是普通的ajax请求。同时设置dataType参数是jsonp。此方式和上述getJSON的方式中，字段名都是callback。

````
function useAjaxJsonp() {
    $.ajax('http://b.test.com:8081/testjsonp?callback=?', {
      dataType: 'jsonp'
    }).done(function(data) {
      console.log(data);
    });
}
````

* $.ajax指定callback相关参数的方法

该方式的好处是具有灵活性，设置了dataType之后，可以设置回调函数的字段名和回调函数名称。

````
function useAjaxArgs() {
    $.ajax('http://b.test.com:8081/testjsonp3', {
      dataType: 'jsonp',
      jsonp: 'cb',
      jsonpCallback: 'cbfunction',
      cache: true,
      success: function(data) {
        console.log(data);
      }
    });
}
````

### JSONP的总结与不足
JSONP可以帮助我们实现前端的跨域请求。但是，在实践的过程中，我们可以看到它存在以下不足：

* **只能使用GET方式发起请求（与其实现原理有关）**。
* **不能很好的发现错误进行处理。与上述ajax的方式相比，不能注册成功、失败的回调函数**。

## CORS的方式
跨域资源共享，Cross-Origin Resource Sharing是由W3C提出的一个用于浏览器以XMLHttpRequest方式向其他源的服务器发起请求的规范。不同于JSONP，CORS是以Ajax方式进行跨域请求，需要服务端与客户端的同时支持。目前CORS在绝大部分现代浏览器中都是支持的。

Cross-Origin Resource Sharing（CORS）跨域资源共享是一份浏览器技术的规范，提供了 Web 服务从不同域传来沙盒脚本的方法，以避开浏览器的同源策略，是 JSONP 模式的现代版。与 JSONP 不同，CORS 除了 GET 要求方法以外也支持其他的 HTTP 要求。用 CORS 可以让网页设计师用一般的 XMLHttpRequest，这种方式的错误处理比 JSONP 要来的好。另一方面，JSONP 可以在不支持 CORS 的老旧浏览器上运作。现代的浏览器都支持 CORS。

简单来讲，CORS的方式主要是后台设置如下响应头字段来实现跨域：

* Access-Control-Allow-Origin
* Access-Control-Allow-Headers
* Access-Control-Allow-Methods

CORS跨域方式的后台核心代码事例:

````
router.all('/test', function(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  // res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'test,other');

  res.send('ok');
});
````
CORS的请求分为预检请求(preflight)和普通请求。

当浏览器的请求方式是HEAD、GET或者POST，并且HTTP的头信息中不会超出以下字段:

* Accept
* Accept-Language
* Content-Language
* Last-Event-ID
* Content-Type：只限于三个值application/x-www-form-urlencoded、multipart/form-data、text/plain

时，浏览器会将该请求定义为简单请求，否则就是预检请求。预检请求会在正式通信之前，增加一次HTTP查询请求。浏览器先询问服务器，当前网页所在的域名是否在服务器的许可名单之中，以及可以使用哪些HTTP动词和头信息字段。只有得到肯定答复，浏览器才会发出正式的XMLHttpRequest请求，否则就报错。

下图是源代码请求过程中关于CORS的截图：

![CORS请求](https://github.com/ToBeNumerOne/cross-domain/blob/master/images/corsrequest.png)

从该图可以看出CORS在每次请求的时候实际发出两次请求

![CORS预请求](https://github.com/ToBeNumerOne/cross-domain/blob/master/images/corsfirst.png)

第一次是预请求，请求方式是OPTIONS

![CORS正式请求](https://github.com/ToBeNumerOne/cross-domain/blob/master/images/corssecond.png)

第二次是真正的请求，请求方式是PUT

## window.name的跨域方式
window对象有个name属性，该属性有个特征：即在一个窗口 (window) 的生命周期内，窗口载入的所有的页面都是共享一个 window.name 的，每个页面对 window.name 都有读写的权限，window.name 是持久存在一个窗口载入过的所有页面中的，并不会因新页面的载入而进行重置。

window 对象的name属性是一个很特别的属性，当该window的location变化，然后重新加载，它的name属性可以依然保持不变。那么我们可以在页面 A中用iframe加载其他域的页面B，而页面B中用JavaScript把需要传递的数据赋值给window.name，iframe加载完成之后，页面A修改iframe的地址，将其变成同域的一个地址，然后就可以读出window.name的值了。这个方式非常适合单向的数据请求，而且协议简单、安全。不会像JSONP那样不做限制地执行外部脚本。

具体实现的核心代码如下：

````
var state = 0,
    iframe = document.createElement('iframe'),
    loadfn = function() {
      if (state === 1) {
        var data = iframe.contentWindow.name;    // 读取数据
        alert(data);    //弹出b页面设置的数据
        iframe.contentWindow.document.write('');
        iframe.contentWindow.close();
        document.body.removeChild(iframe);
        iframe.src = '';
        iframe = null;
     } else if (state === 0) {
        state = 1;
        iframe.contentWindow.location = "http://a.test.com:8081/pages/windowname/proxy.html";    // 设置的代理文件
          }
        };
    iframe.style.display = 'none';
    iframe.src = 'http://b.test.com:8081/pages/windowname/data.html';
    if (iframe.attachEvent) {
      iframe.attachEvent('onload', loadfn);
    } else {
      iframe.onload  = loadfn;
    }
    document.body.appendChild(iframe);
````

## window.postMessage()的方式
这个方法是 HTML5 的一个新特性，可以用来向其他所有的 window 对象发送消息。需要注意的是我们必须要保证所有的脚本执行完才发送 MessageEvent，如果在函数执行的过程中调用了他，就会让后面的函数超时无法执行，从而造成阻塞。[有关postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)

**核心原理是使用postMessage API**
```` otherWindow.postMessage(message, targetOrigin, [transfer]);````

具体实现的核心代码如下:

a.test.com下的pageA代码：

````
// pageA 页面

window.onload = function() {
    var receiver = document.getElementById('receiverIframe').contentWindow;
    var postBtn = document.getElementById('postMessageBtn');
    var openBtn = document.getElementById('openNewWindowBtn');
    var messageEle = document.getElementById('message');

    function sendMessage() {
      receiver.postMessage('Hello Page B.. This is page A.. You are my iframe', 'http://b.test.com:8081');
    }

    function openNewWindow() {
      var pageB = window.open('http://b.test.com:8081/pages/postmessage/pageB.html');

      setTimeout(function() {
        pageB.postMessage('Hello Page B.. This is Page A.. (form PageA window.open())', 'http://b.test.com:8081');
      }, 500)
    }

    function receiveMessage(event) {
      console.log(event);

      if (event.origin !== 'http://b.test.com:8081') return;

      messageEle.innerHTML = "Message Received: " + event.data;
    }

    postBtn.addEventListener('click', sendMessage, false);

    openBtn.addEventListener('click', openNewWindow, false);

    window.addEventListener('message', receiveMessage, false);
  }
````

b.test.com下面的pageB代码：

````
// pageB 页面

window.onload = function() {
    var postBtn = document.getElementById('postMessageBtn')
    var messageEle = document.getElementById('message');

    function receiveMessage(event) {
      console.log(event);

      if (event.origin !== 'http://a.test.com:8081') return;

      messageEle.innerHTML = "Message Received: " + event.data;

      // 接收 PageA 的任何消息都自动回复并加上时间戳
      event.source.postMessage('Hello Page A.. This is page B.. (from PageB autoreply) timestamp = ' + new Date().getTime(), event.origin);
    }

    function sendMessage() {
      // 这里需要特别注意！！！
      // 直接打开 PageB (当前页面) 是无法向 PageA 发送跨域信息的！！！
      // 只有当 PageB (当前页面) 处于 PageA 页面内的 iframe 中的时候才能发送跨域信息
      // 而且此处不能使用 window.postMessage()
      // 因为 PageB (当前页面) 是 PageA 页面内嵌入的 iframe
      // 此时 PageB 的 window 指向的是 PageA 内 iframe 框架内的 window
      // 而当前情况需要指向父级 window (即 top 或者 parent) 才能进行 postMessage
      top.postMessage('Hello Page A.. This is page B..', 'http://a.test.com:8081');
    }

    postBtn.addEventListener('click', sendMessage, false);

    window.addEventListener('message', receiveMessage, false);
  }
````


**注意：只有通过window.open或者嵌套iframe的方式才能使用此方式进行跨域的双向通信。**

# 笔者说
以上是关于跨域方法的总结，更多的是偏向前端跨域方式的总结。其实还有其他后端跨域的方法，读者如果对于这块感兴趣可以自行查阅相关资料。

ps：

**本人水平有限，如果写的有不对之处，欢迎拍砖指正！**
