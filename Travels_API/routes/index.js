var express = require('express');
var router = express.Router();
var ListaV = require('../controllers/viagem')

// GET: os vários pedidos

router.get('/getviagens', function(req, res, next) {
  ListaV.list()
    .then(ListaVs => {
      res.jsonp(ListaVs)
    })
    .catch(erro => {
      res.render('error', {error: erro, message: "Erro na obtenção das viagens."})
    })
});

router.get('/getviagens/:id', function(req, res) {
  ListaV.getViagem(req.params.id)
    .then(ListaV => {
      if (!ListaV) {
        return res.status(404).json({ error: "Viagem não encontrada." });
      }
      res.jsonp(ListaV);
    })
    .catch(erro => {
      res.status(500).json({ error: erro, message: "Erro na obtenção da viagem." });
    });
});

// router.get('/getviagens/:id', function(req, res) {
//   ListaV.getViagem(req.params.id)
//     .then(({ viagem, totalGastosCartao, totalGastosDinheiro, quantiaDisponivel }) => {
//       res.jsonp({ viagem, totalGastosCartao, totalGastosDinheiro, quantiaDisponivel });
//     })
//     .catch(erro => {
//       res.status(500).json({ error: erro.message, message: "Erro na obtenção da viagem." });
//     });
// });



// Add viagem
router.post('/addViagem', function(req, res) {
  console.log("Dados recebidos na API:", req.body);
  
  ListaV.addViagem(req.body)
    .then(ListaV => {
      console.log("Viagem adicionada com sucesso:", ListaV);
      res.jsonp(ListaV);
    })
    .catch(erro => {
      console.log("Erro na inserção da Viagem:", erro);
      res.render('error', {error: erro, message: "Erro na inserção da Viagem"});
    });
});

// Add gasto to viagem
router.post('/getviagens/:id/add-gasto', function(req, res) {
  ListaV.addGasto(req.params.id, req.body)
    .then(viagem => {
      res.jsonp(viagem);
    })
    .catch(erro => {
      res.render('error', { error: erro, message: "Erro ao adicionar gasto" });
    });
});

// router.get('/api/categorias', function(req, res) {
//   ListaV.categorias()
//     .then(ListaV => {
//       res.jsonp(ListaV)
//     })
//     .catch(erro => {
//       res.render('error', {error: erro, message: "Erro na obtenção das categorias"})
//     })
// });

// router.get('/api/categorias/:id/produtos', function(req, res) {
//   ListaV.prodsByCateg(req.params.id)
//     .then(ListaV => {
//       res.jsonp(ListaV)
//     })
//     .catch(erro => {
//       res.render('error', {error: erro, message: "Erro na obtenção das categorias"})
//     })
// });

// // POST: de uma ListaV de compras

// // POST: de um produto numa ListaV de compras

// router.post('/api/ListaVs/:id/produtos', function(req, res) {
//   ListaV.addProduto(req.params.id, req.body)
//     .then(dados => {
//       res.jsonp(dados)
//     })
//     .catch(erro => {
//       res.render('error', {error: erro, message: "Erro na inserção de um produto"})
//     })
// })

// // DELETE de um produto numa ListaV de compras

// router.delete('/api/ListaVs/:id/produtos/:prod', function(req, res) {
//   ListaV.deleteProduto(req.params.id, req.params.prod)
//     .then(dados => {
//       res.jsonp(dados)
//     })
//     .catch(erro => {
//       res.render('error', {error: erro, message: "Erro na inserção de um produto"})
//     })
// })


module.exports = router;
