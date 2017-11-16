var express = require('express');
var bodyParser = require('body-parser');
var API = require('./router')
var config = require('./config')
var app = express();
app.use(bodyParser());
app.use(express.static('frontend'))
app.use(API)

app.listen(config.port)