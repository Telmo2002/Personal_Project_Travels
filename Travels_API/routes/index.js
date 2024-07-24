var express = require('express');
var router = express.Router();
var ListaV = require('../controllers/viagem')

// GET: os vários pedidos

router.get('/api/', function(req, res, next) {
  ListaV.list()
    .then(ListaVs => {
      res.jsonp(ListaVs)
    })
    .catch(erro => {
      res.render('error', {error: erro, message: "Erro na obtenção das viagens"})
    })
});

// router.get('/api/:id', function(req, res) {
//   ListaV.getviagem(req.params.id)
//     .then(ListaV => {
//       res.jsonp(ListaV)
//     })
//     .catch(erro => {
//       res.render('error', {error: erro, message: "Erro na obtenção da ListaV de compras"})
//     })
// });

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

// router.post('/api/ListaVs', function(req, res) {
//   ListaV.addListaV(req.body)
//     .then(ListaV => {
//       res.jsonp(ListaV)
//     })
//     .catch(erro => {
//       res.render('error', {error: erro, message: "Erro na inserção da ListaV"})
//     })
// })

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
