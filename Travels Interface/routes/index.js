var express = require('express');
var router = express.Router();
var env = require('../config/env');
var axios = require('axios');

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

// GET home page
router.get('/', function(req, res) {
  axios.get(`${env.apiAccessPoint}/getviagens`)
    .then(response => {
      res.render('index', { viagens: response.data });
    })
    .catch(err => {
      console.error('Erro ao buscar viagens:', err.message);
      res.render('error', { error: err.message });
    });
});

// GET detalhes da viagem
router.get('/viagem/:id', function(req, res) {
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
router.post('/viagem/:id/add-gasto', function(req, res) {
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
router.post('/viagem/:id/delete', function(req, res) {
  axios.post(`${env.apiAccessPoint}/deleteViagens/${req.params.id}`)
    .then(response => {
      req.flash('success_msg', 'Viagem eliminada com sucesso.');
      res.redirect('/');
    })
    .catch(err => {
      console.error('Erro ao eliminar viagem:', err.message);
      req.flash('error_msg', 'Erro ao eliminar a viagem.');
      res.redirect('/');
    });
});

// GET create task page
router.get('/create-task', function(req, res, next) {
  res.render('create-task');
});

// POST submit task
router.post('/submit-task', async function(req, res, next) {
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
      res.redirect('/');
    } else {
      console.error('Erro ao criar a viagem:', response.data);
      res.status(500).send('Erro ao criar a viagem');
    }
  } catch (error) {
    console.error('Erro ao enviar dados para a API:', error);
    res.status(500).send('Erro ao criar a viagem');
  }
});

module.exports = router;
