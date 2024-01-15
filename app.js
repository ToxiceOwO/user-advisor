var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var jwt = require('jsonwebtoken');
var checkStatus = require('./services/checkStatus');
const HttpStatusCodes = require('./constants/httpStatusCodes');

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var advisorRouter = require('./routes/advisor');

var app = express();

checkStatus.schedule();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/advisor', advisorRouter);
app.use('/', indexRouter);
app.use('/user', userRouter);


// catch HttpStatusCodes.NOT_FOUND and forward to error handler
app.use(function (req, res, next) {
  next(createError(HttpStatusCodes.NOT_FOUND));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || HttpStatusCodes. INTERNAL_SERVER_ERROR);
  res.render('error');
});

module.exports = app;
