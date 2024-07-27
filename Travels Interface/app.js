var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var createError = require('http-errors'); // Certifique-se de que createError está importado
var axios = require('axios');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// Configuração do EJS
app.set('views', path.join(__dirname, 'views')); // Diretório onde os arquivos EJS estão localizados
app.set('view engine', 'ejs'); // Define o EJS como o mecanismo de visualização

// Middleware setup
app.use(logger('dev'));  // Log requests
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Routers
app.use('/', indexRouter); // Routes for the main application
app.use('/users', usersRouter); // Routes for users

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404)); // Usar createError para gerar erro 404
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error', { error: err.message }); // Render a view named 'error.ejs' in the 'views' folder
});

module.exports = app;
