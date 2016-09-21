# Usage
该跨域的库封装了jsonp、window.name、iframe+documen.domain、postMessage的跨域方式。总的调用方法如：

```
import your-name from '/your path/cross.js';
your-name(args).jsonp();

args 是一个对象：
其中包含的字段如下：
{
   url: 'http://b.test.com:8081/testjsonp',
   data: {test: 'ok', a:1, b:2},
   // 返回成功的回调函数
   callback: function(data){
      console.log(data);
   }
}

```

## jsonp的调用方式
jsonp的调用方式如下：

```
import cross from '../../cross-domain';
var args = {
	 // 请求的域的url
    url: 'http://b.test.com:8081/testjsonp',
    data: {test: 'ok', a:1, b:2},
    callback: function(data){
      console.log(data);
    }
  };
  cross(args).jsonp();
  
```

## window.name的调用

发起请求端：

```
var args = {
  // 需要请求的url，页面中没有iframe，则使用url创建iframe，
  // 该选项和下面的iframeSrc是互斥的，二选一则可。
  // url: 'http://leehey.org/crossjs/window_name/data.html',
  // 如果已经存在iframe的请求
  iframeSrc: document.getElementById('dataFrame'),
  // 是否删除页面中的iframe，针对跨域请求完成从而删除iframe
  removeIFrame: false,
  callback: function (data) {
    console.log(data);
  }
};

cross(args).winnameRequest();
```

返回数据端-即设置window.name端：

```
import cross from '../../cross-domain';

var args = {
  // 此处的processData返回数据
  // 返回数据之后赋值给window.name。
  processData: function() {
    return "test data from data.html";
  }
};
// 此处调用的是winnameResponse()
// 发起请求端调用的是winnameRequest().
cross(args).winnameResponse();
```

## iframe+document.domain的调用方式

请求的发起方：

```
var args = {
    url: 'http://b.test.com:8081/pages/iframe/middle.html',
    // 两个子域共同的根域。
    domain: 'test.com',
    removeIFrame: false,
    // 成功的回调函数
    callback: function(data){
      console.log(data)
    }
  };
  cross(args).docDomainRequest();
```

被请求方的调用：

```
var args = {
    url: 'http://b.test.com:8081/pages/iframe/middle.html',
    // 两个子域共同的根域。
    domain: 'test.com',
    removeIFrame: false,
    // 成功的回调函数
    callback: function(data){
      console.log(data)
    }
  };
  cross(args).docDomainResponse();
```

## postMessage的调用方式

请求的发起方：
```
var args = {
  // 目标url
  url: 'http://b.test.com:8081/test/postmsg/data.html',
  //url: 'http://b.test.com:8081/pages/postmessage/pageB.html',
  //removeIFrame: true,
  // 发送消息域的源----此处是被请求的url的源
  sourceOrigin: 'http://b.test.com:8081',
  // 给目标url传递的数据
  processData: function () {
    return 'data send from a.test.com';
  },
  // 接收到数据时的处理函数
  callback: function(data){
    console.log(data);
  }
};
// 绑定监听事件
cross(args).postMsgReceive();

// 发送消息事件可以由按钮事件触发
cross(args).postMsgSend();
```

被请求方：


```
import cross from '../../cross-domain';

var btn = document.getElementById('send');

var args = {
  // 将要发送到的目标url，此处值得是请求方的url
  url:'http://a.test.com:8081/test/postmsg/index.html',
  // 请求方的域，安全检查时候用
  // 检查在接受到消息时是否来自指定域
  sourceOrigin: 'http://a.test.com:8081',
  // 数据生成函数
  processData: function () {
    return 'data send from ------ b.test.com';
  },
  // 接受到数据时的回调函数
  callback: function(data){
    alert(data);
  }
};
cross(args).postMsgReceive();
// 例如由按钮触发发送消息
btn.addEventListener('click', cross(args).postMsgSendFromIframe(), false);
```






