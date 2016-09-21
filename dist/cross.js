/**
 * Cross Domain lib
 * @author: Jason Cheng
 */

'use strict';

function cross(args){

  let transform = function (obj){
    var str = '';
    for(var key in obj){
      if (obj[key]){
        str+=key;
        str+='=';
        str+=obj[key];
        str+='&';
      }
    }
    return str.slice(0,-1);
  }

  let jsonp = function () {
    try {
      if (!args.url){
        throw 'url is required!';
      } else {
        // 动态生成script标签
        var script = document.createElement('script');
        document.body.appendChild(script);
        // 此处注意,这个callback的属性名前后端必须得事先协调一致
        var data = args.data || {};
        // 设置函数字段
        // 中间加入时间戳,防cache
        // ********  注意  *********
        // 此处的callback属性可以是其他名称,前后端必须事先商量好
        data.callback = 'jsonp' + new Date().getTime();
        // 将本地函数绑定到全局,这样后台返回的代码可以直接执行
        window[data.callback] = args.callback;

        args.url += '?' + transform(data);
        script.src = args.url;
        // 加载完成,删除script标签
        script.onload = function () {
          document.body.removeChild(script);
        }
      }
    } catch (e){
      console.log(e);
    }
  };

  let winname = {};
  winname.req = function(){
    try{
      if (!args.iframeSrc && !args.url){
        throw 'url or frame src is required!';
      }
      var removeIFrame = (args.removeIFrame === true) ? args.removeIFrame : false;

      var state = 0;

      // 如果只有url,则通过url创建iframe
      if (args.url){
        var iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.id = 'dataFrame';
        iframe.src = args.url;
      } else {
        // 否则直接使用页面中存在的iframe
        var iframe = args.iframeSrc;
      }

      var dataFrame = false;
      var otherDocument = false;

      var loadfn = function(){
        if (state === 1){
          var data = otherDocument.name;
          args.callback(data);
          (! removeIFrame) || (!iframe.parentNode) || iframe.parentNode.removeChild(iframe);
        } else if(state === 0){
          state = 1;
          dataFrame = document.getElementById('dataFrame');
          otherDocument = dataFrame.contentWindow || dataFrame.contentDocument;
          otherDocument.location = 'about:blank';
        }
      };

      if (iframe.attachEvent){
        iframe.attachEvent('onload', loadfn);
      } else {
        iframe.onload = loadfn;
      }

    } catch (e){
      console.log(e);
    }
  };

  winname.res = function () {
    try{
      if (args.processData){
        window.name = args.processData();
      }
    } catch(e){
      console.log(e);
    }
  };
  
  let postMsg = {};
  postMsg.req = function () {
    try {
      if (!window.postMessage) {
        throw 'postMessage method is not support, please try another way!';
      }
      if (!args.iframeSrc && !args.url) {
        throw 'url or iframe is required!';
      }

      if (!args.processData) {
        throw 'function for generating data is required!';
      }

      var removeIFrame = (args.removeIFrame === true)? args.removeIFrame : false;

      var sendMsg = function() {

        var frameWindow = iframe.contentWindow || iframe.contentDocument;
        if (args.iframeSrc) {
          frameWindow.postMessage(getData, iframe.src);
        }
        else {
          frameWindow.postMessage(getData, args.url);
        }
      };

      if (args.url) {
        if (!document.getElementById('dataFrame')){
          var iframe = document.createElement('iframe');
          //iframe.style.display = 'none';
          iframe.src = args.url;
          iframe.id = 'dataFrame';
          // iframe.onload = sendMsg;
        } else {
          var iframe = document.getElementById('dataFrame');
          // iframe.onload = sendMsg;
        }
      } else if(args.iframeSrc){
        var iframe = args.iframeSrc;
        // iframe.onload = sendMsg;
      }

      var getData = args.processData();

      document.body.appendChild(iframe);



      window.onload = sendMsg;

      if (window.attachEvent) {
        window.attachEvent('onmessage', function(event){
          if (args.callback) {
            args.callback(event.data);
          }
        });
      }
      else {
        window.addEventListener('message', function(event){
          if (args.callback) {
            args.callback(event.data);
          }
        }, true);
      }


    }
    catch (e) {
      console.log(e);
    }
  };

  postMsg.res = function(){
    try {
      if (!window.postMessage) {
        throw 'postMessage is not support, please try another way!';
      }
      if (!args.url) {
        throw 'url from the request side is required!';
      }
      if (!args.processData) {
        throw 'function for generate data is required!';
      }
      // 获取将要传递给request的数据
      var getData = args.processData();
      var sendMsg = function() {
        parent.postMessage(getData, args.url);
      };

      //window.onload = sendMsg;

      if (window.attachEvent) {
        window.attachEvent('onmessage', function(event){
          if (args.callback) {
            args.callback(event.data);
            sendMsg();
          }
        });
      }
      else {
        window.addEventListener('message', function(event){
          if (args.callback) {
            args.callback(event.data);
            sendMsg();
          }
        }, true);
      }

    }
    catch (e) {
      console.log(e);
    }
  };

  let docDomain = {};
  docDomain.req = function(){
    try{
      if (! args.iframeSrc && ! args.url) {
        throw 'iframe src or url is required!';
      }
      if (! args.domain) {
        throw 'root domain is required!';
      }

      var removeIFrame = (args.removeIFrame === true)? args.removeIFrame : false;

      if (args.url) {
        var iframe = document.createElement("iframe");
        iframe.style.display = 'none';
        iframe.src = args.url;
        document.body.appendChild(iframe);
      }
      else {
        var iframe = args.iframeSrc;
      }

      document.domain = args.domain;

      iframe.onload = function() {

        if (iframe.contentDocument || iframe.contentWindow.document){
          var dataDocument = iframe.contentWindow;

          if (args.callback) {

            dataDocument.doAjax(args.callback);

            //args.callback(dataDocument);

            (! removeIFrame) || (!iframe.parentNode) || iframe.parentNode.removeChild(iframe);

          }
        }
        else {
          throw 'cannot get data';
        }

      }
    } catch(e) {
      console.log(e);
    }
  };
  
  docDomain.res = function () {
    try{
      if (! args.domain) {
        throw 'root domain is required!';
      }

      document.domain = args.domain;

      if(args.midRequest && args.callback){
        args.midRequest(args.callback);
      } else {
        throw 'middle request & callback in the origin is required!';
      }

    } catch (e){
      console.log(e);
    }
  };

  return {
    jsonp: jsonp,
    winnameRequest: winname.req,
    winnameResponse: winname.res,
    postMsgRequest: postMsg.req,
    postMsgResponse: postMsg.res,
    docDomainRequest: docDomain.req,
    docDomainResponse: docDomain.res
  }

}

module.exports = cross;