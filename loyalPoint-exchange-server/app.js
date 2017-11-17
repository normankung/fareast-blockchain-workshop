var express = require('express');
var bodyParser = require('body-parser');
var API = require('./router')
var config = require('./config')
var app = express();
var http = require('http').Server(app);
require('./io').init(http);
app.use(bodyParser());

app.use(express.static('front-end'))
app.use(API)

http.listen(config.port, function () {
    console.log('listening on *:3000');
});
/// hahhaha /hahah2