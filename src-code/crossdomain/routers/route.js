var express = require('express');
var router = express.Router();

router.all('/', function (req, res) {
  res.sendFile('../src/index.html');
});

router.all('/test', function(req, res) {

  //res.setHeader('Access-Control-Allow-Origin', '*');
  //res.setHeader('Access-Control-Allow-Origin', '*');
  //res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  //res.setHeader('Access-Control-Allow-Headers', 'test,other');

  res.send('ok');
});

router.all('/testcors', function(req, res) {

  //res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Origin', 'http://a.test.com:8081');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'test,other');

  res.send('ok');
});

router.all('/testjsonp', function(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(req.query.callback + '(' + JSON.stringify({a:1, b:2}) + ')');
});

router.all('/testjsonp3', function(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(req.query.cbname + '(' + JSON.stringify({a:1, b:2}) + ')');
});

module.exports = router;