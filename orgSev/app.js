var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var config = require('./config');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function(socket){
  console.log('a user connected');
});

var index = require('./routes/index');
var trigger = require('./routes/trigger');
var receive = require('./routes/receive');
var monitor = require('./routes/monitor');

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(express.static('front-end'));

app.use('/', index);
app.use('/trigger', trigger);
app.use('/receive', receive);
app.use('/monitor', monitor);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

http.listen(config.orgSevConfig.port)

// module.exports = app;
