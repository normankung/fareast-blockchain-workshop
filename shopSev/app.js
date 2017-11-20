var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var config = require('./config');

var app = express();
var http = require('http').Server(app);
require('./io').init(http);

var API = require('./routes')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('front-end'));

app.use(API)

http.listen(config.shopSevConfig.port, function(){
  console.log("Listening on port "+config.shopSevConfig.port)
})