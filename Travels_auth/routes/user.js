var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var passport = require('passport');
var auth = require('../auth/auth');
var User = require('../controllers/user');

// Rota para listar todos os usuários
router.get('/', auth.verificaAcesso, function(req, res) {
    User.list()
        .then(dados => res.status(200).jsonp({ dados: dados }))
        .catch(e => res.status(500).jsonp({ error: e }));
});

// Rota para obter um usuário específico
router.get('/:id', auth.verificaAcesso, function(req, res) {
    User.getUser(req.params.id)
        .then(dados => res.status(200).jsonp({ dados: dados }))
        .catch(e => res.status(500).jsonp({ error: e }));
});

// Rota para adicionar um novo usuário
router.post('/register', function(req, res) {
  var d = new Date().toISOString().substring(0,19);

  // Remover espaços em branco no início e fim do nome de usuário
  var trimmedUsername = req.body.username.trim();

  // Se o nome de usuário for apenas espaços em branco, retornar um erro
  if (trimmedUsername.length === 0) {
      return res.status(400).jsonp({ error: "O nome de usuário não pode estar vazio ou conter apenas espaços." });
  }

  // Criar o objeto do novo usuário
  var newUser = {
      username: trimmedUsername,
      active: true, 
      dateCreated: d
  };

  // Registrar o usuário usando a função do controlador
  User.addUser(newUser, req.body.password)
      .then(user => {
          // Autenticar o usuário após o registro usando o nome de usuário sanitizado
          req.login(user, function(err) {  // Usar req.login para garantir que o usuário registrado está sendo autenticado
              if (err) {
                  return res.status(500).jsonp({ error: "Erro ao autenticar o usuário: " + err });
              }

              jwt.sign(
                  { 
                      username: trimmedUsername, // Usar o nome de usuário sanitizado
                    //   level: req.user.level, 
                      sub: 'telmo2002 project' 
                  }, 
                  "telmo2002",
                  { expiresIn: 3600 },
                  function(e, token) {
                      if (e) {
                          res.status(500).jsonp({ error: "Erro na geração do token: " + e });
                      } else {
                          res.status(201).jsonp({ token: token });
                      }
                  }
              );
          });
      })
      .catch(err => {
          res.status(500).jsonp({ error: err.message || err, message: "Register error: " + err.message || err });
      });
});





// Rota para login
router.post('/login', (req, res, next) => {
  // Remove espaços extras dos dados de login antes de chamar o middleware de autenticação
  req.body.username = req.body.username.trim();
  next();
  }, passport.authenticate('local'), function(req, res) {
  jwt.sign(
      { username: req.user.username, sub: 'telmo2002 project' },
      "telmo2002",
      { expiresIn: 3600 },
      (e, token) => {
          if (e) res.status(500).jsonp({ error: "Erro na geração do token: " + e });
          else res.status(201).jsonp({ token: token });
      }
  );
});


// Rota para atualizar um usuário
router.put('/:id', auth.verificaAcesso, function(req, res) {
    User.updateUser(req.params.id, req.body)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.render('error', { error: erro, message: "Erro na alteração do utilizador" }));
});

// Rota para desativar um usuário
router.put('/:id/desativar', auth.verificaAcesso, function(req, res) {
    User.updateUserStatus(req.params.id, false)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.render('error', { error: erro, message: "Erro na alteração do utilizador" }));
});

// Rota para ativar um usuário
router.put('/:id/ativar', auth.verificaAcesso, function(req, res) {
    User.updateUserStatus(req.params.id, true)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.render('error', { error: erro, message: "Erro na alteração do utilizador" }));
});

// Rota para atualizar a senha de um usuário
router.put('/:id/password', auth.verificaAcesso, function(req, res) {
    User.updateUserPassword(req.params.id, req.body)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.render('error', { error: erro, message: "Erro na alteração do utilizador" }));
});

// Rota para remover um usuário
router.delete('/:id', auth.verificaAcesso, function(req, res) {
    User.deleteUser(req.params.id)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.render('error', { error: erro, message: "Erro na remoção do utilizador" }));
});

module.exports = router;
