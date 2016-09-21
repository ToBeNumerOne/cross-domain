# Usage
该跨域的库封装了jsonp、window.name、iframe+documen.domain、postMessage的跨域方式。调用方法如：

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
  // url: 'http://leehey.org/crossjs/window_name/data.html',
  iframeSrc: document.getElementById('dataFrame'),
  removeIFrame: false,
  // 接受到返回值得回调函数
  // 用于和另一个源的url进行双向通信
  callback: function (data) {
    console.log(data);
  }
};

cross(args).winnameRequest();
```

被请求方：


```
var args = {
    url: 'http://a.test.com:8081/test/postmsg/index.html',
    // 发起请求的域
    sourceOrigin: 'http://a.test.com:8081',
    // 目标域
    targetOrigin:'http://b.test.com:8081',
    // 发送的数据
    data: {test: 'ok', a:1, b:2},
    removeIFrame: false,
    // return出返回给发起请求方的数据
    processData: function () {
      return 'data send from ------ other domain!';
    },
    // 接受到请求方请求之后的数据处理函数
    callback: function(data){
      alert(data);
    }
  };
  cross(args).postMsgResponse();
```






