var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended:false
}));

app.use(express.static(path.join(__dirname, 'src')));

// 使用中间件编写一次代码
// 使得所有后端服务允许跨域
// http://enable-cors.org/server.html
// 具体各种服务器的设置参见上述网址

//app.use(function(req, res, next) {
//  res.header("Access-Control-Allow-Origin", "*");
//  res.header("Access-Control-Allow-Headers", "test");
//  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
//  next();
//});

app.use('/', require('./routers/route.js'));

var DEFAULT_PORT = 8081;
app.listen(DEFAULT_PORT);
console.log('server is started at port: %d', DEFAULT_PORT);