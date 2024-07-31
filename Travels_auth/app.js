var createError = require('http-errors');
var express = require('express');
var logger = require('morgan');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var session = require('express-session');

// Conexão ao MongoDB
mongoose.connect('mongodb://127.0.0.1/travels_auth')
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro de conexão ao MongoDB:', err));

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro de conexão ao MongoDB...'));
db.once('open', function() {
    console.log("Conexão ao MongoDB realizada com sucesso...");
});

// Configuração do Passport
var User = require('./models/user'); // Certifique-se de que este caminho está correto
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var app = express();

// Configuração do middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: 'yourSecretKey', // Substitua por uma chave secreta segura
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Roteador de usuários
var usersRouter = require('./routes/user');
app.use('/users', usersRouter);

// Captura de 404 e redirecionamento para o handler de erros
app.use(function(req, res, next) {
  next(createError(404));
});

// Handler de erros
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json({ error: err });
});

module.exports = app;
