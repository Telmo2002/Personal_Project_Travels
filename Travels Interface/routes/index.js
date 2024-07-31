var express = require('express');
var router = express.Router();
var env = require('../config/env');
var axios = require('axios');
var jwt = require('jsonwebtoken');

// Função para formatar a data
function formatDate(dateString) {
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-PT', options).format(date).replace(',', ' às') + 'h';
}

// Middleware para verificar o token JWT
function verifyToken(req, res, next) {
  const token = req.cookies.token || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, 'telmo2002', (err, decoded) => {
      if (err) {
        return res.status(403).render('error', { error: 'Token inválido ou expirado.' });
      }
      req.user = decoded;
      next();
    });
  } else {
    res.status(403).render('error', { error: 'Token não fornecido.' });
  }
}

// GET home page
router.get('/', verifyToken, function(req, res) {
  axios.get(`${env.apiAccessPoint}/getviagens`)
    .then(response => {
      res.render('index', {
        viagens: response.data
      });
    })
    .catch(err => {
      console.error('Erro ao buscar viagens:', err.message);
      res.render('error', { error: err.message });
    });
});

// GET detalhes da viagem
router.get('/viagem/:id', verifyToken, function(req, res) {
  var viagemId = req.params.id;

  axios.get(`${env.apiAccessPoint}/getviagens/${viagemId}`)
    .then(response => {
      var viagem = response.data;

      // Calcular total gasto em cartão e dinheiro
      var totalGastosCartao = viagem.gastos
        .filter(gasto => gasto.metodoPag === 'cartao')
        .reduce((acc, gasto) => acc + gasto.amount, 0);

      var totalGastosDinheiro = viagem.gastos
        .filter(gasto => gasto.metodoPag === 'dinheiro')
        .reduce((acc, gasto) => acc + gasto.amount, 0);

      var quantiaDisponivel = viagem.amount - (totalGastosCartao + totalGastosDinheiro);

      // Formatar a data
      viagem.dateFormatted = formatDate(viagem.date);

      // Renderizar a página com todos os dados necessários
      res.render('viagem', {
        viagem,
        totalGastosCartao,
        totalGastosDinheiro,
        quantiaDisponivel
      });
    })
    .catch(err => {
      console.error('Erro ao buscar detalhes da viagem:', err.message);
      res.render('error', { error: err.message });
    });
});

// POST add gasto to viagem
router.post('/viagem/:id/add-gasto', verifyToken, function(req, res) {
  const gastoData = {
    name: req.body.gastoName,
    amount: req.body.gastoQuantia,
    metodoPag: req.body.pagamento
  };

  axios.post(`${env.apiAccessPoint}/getviagens/${req.params.id}/add-gasto`, gastoData)
    .then(response => {
      res.redirect(`/viagem/${req.params.id}`);
    })
    .catch(err => {
      console.error('Erro ao adicionar gasto:', err.message);
      res.render('error', { error: err.message });
    });
});

// POST para excluir uma viagem
router.post('/viagem/:id/delete', verifyToken, function(req, res) {
  axios.post(`${env.apiAccessPoint}/deleteViagens/${req.params.id}`)
    .then(response => {
      req.flash('success', 'Viagem eliminada com sucesso.');
      res.redirect('/');
    })
    .catch(err => {
      console.error('Erro ao eliminar viagem:', err.message);
      req.flash('error', 'Erro ao eliminar a viagem.');
      res.redirect('/');
    });
});

// GET create task page
router.get('/create-task', verifyToken, function(req, res, next) {
  res.render('create-task');
});

// POST submit task
router.post('/submit-task', verifyToken, async function(req, res, next) {
  try {
    const taskData = {
      name: req.body.taskName,
      amount: req.body.quantiaDisp,
      description: req.body.taskDescription,
      date: req.body.date
    };

    const response = await axios.post(env.apiAccessPoint + "/addviagem", taskData);
    if (response.status === 200) {
      console.log('Viagem criada com sucesso!');
      req.flash('success', 'Viagem criada com sucesso.');
      res.redirect('/');
    } else {
      console.error('Erro ao criar a viagem:', response.data);
      req.flash('error', 'Erro ao criar a viagem.');
      res.status(500).send('Erro ao criar a viagem');
    }
  } catch (error) {
    console.error('Erro ao enviar dados para a API:', error);
    req.flash('error', 'Erro ao criar a viagem.');
    res.status(500).send('Erro ao criar a viagem');
  }
});

// GET login page
router.get('/login', function(req, res) {
  res.render('login')
    // success: req.flash('success'),
    // error: req.flash('error')
});

// POST login
router.post('/login', function(req, res) {
  axios.post(`http://localhost:7003/users/login`, req.body)
    .then(response => {
      res.cookie('token', response.data.token, { httpOnly: true });
      req.flash('success', 'Login bem-sucedido.');
      res.redirect('/');
    })
    .catch(error => {
      req.flash('error', 'Credenciais inválidas.');
      res.redirect('/login');
    });
});

// GET register page
router.get('/register', function(req, res) {
  res.render('register', {
    success: req.flash('success'),
    error: req.flash('error')
  });
});

// POST register
router.post('/register', function(req, res) {
  axios.post(`http://localhost:7003/register`, req.body)
    .then(response => {
      req.flash('success', 'Registro bem-sucedido. Por favor, faça login.');
      res.redirect('/login');
    })
    .catch(error => {
      req.flash('error', 'Erro ao registrar o usuário.');
      res.redirect('/register');
    });
});

module.exports = router;
