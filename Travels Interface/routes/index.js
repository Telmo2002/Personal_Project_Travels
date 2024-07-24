var express = require('express');
var router = express.Router();
var env = require('../config/env')
var axios = require('axios')

/* GET home page. */

router.get('/retrieveAll', function(req, res) {
  var data = new Date().toISOString().substring(0,19)
  axios.get(env.apiAccessPoint+"/listas")
    .then(response => {
      res.render('index', { lists: response.data, d: data });
    })
    .catch(err => {
      res.render('error', {error: err})
    })
});

router.get('/retrieveList/:id', function(req, res) {
  var data = new Date().toISOString().substring(0,19)
  axios.get(env.apiAccessPoint+"/listas/" + req.params.id)
    .then(response => {
      res.render('listaCompras', { list: response.data, d: data });
    })
    .catch(err => {
      res.render('error', {error: err})
    })
});

router.get('/lista/:idLista/deleteProduto/:idProd', function(req, res) {
  var data = new Date().toISOString().substring(0,19)
  console.log(req.params.idProd)
  axios.delete(env.apiAccessPoint+"/listas/"+ req.params.idLista +"/produtos/"+ req.params.idProd)
    .then(response => {
      res.redirect('/retrieveList/' + req.params.idLista)
    })
    .catch(err => {
      res.render('error', {error: err})
    })
});

module.exports = router;
