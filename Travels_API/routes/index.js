var express = require('express');
var router = express.Router();
var ListaV = require('../controllers/viagem')



// GET: os vários pedidos
router.get('/getviagens/inicial/:userID', function(req, res, next) {
  console.log("entrou aqui");
  ListaV.listByUser(req.params.userID)
    .then(ListaVs => {
      res.jsonp(ListaVs);
    })
    .catch(erro => {
      res.render('error', {error: erro, message: "Erro na obtenção das viagens."});
    });
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

// POST para excluir uma viagem
router.post('/deleteViagens/:id', function(req, res) {
  ListaV.deleteViagem(req.params.id)
    .then(dados => {
      res.jsonp(dados);
    })
    .catch(erro => {
      res.render('error', { error: erro, message: "Erro na eliminação da viagem." });
    });
});


module.exports = router;

































// var express = require('express');
// var router = express.Router();
// var ListaV = require('../controllers/viagem');
// var jwt = require('jsonwebtoken');

// // Middleware de proteção de rotas
// function verifyToken(req, res, next) {
//   const token = req.cookies.token || req.headers['x-access-token'];
//   console.log("Token recebido no middleware:", token);

//   if (token) {
//     jwt.verify(token, 'telmo2002', (err, decoded) => {
//       if (err) {
//         console.error('Erro ao verificar token:', err);
//         return res.status(403).json({ error: 'Token inválido ou expirado.' });
//       }
//       req.user = decoded.username;
//       console.log('Token decodificado:', req.user);
//       next();
//     });
//   } else {
//     console.error('Nenhum token fornecido.');
//     res.status(403).json({ error: 'Token não fornecido.' });
//   }
// }

// // GET: os vários pedidos
// router.get('/getviagens', function(req, res, next) {
//   token = req.cookies.token

//   jwt.verify(token, 'telmo2002', (err, decoded) => {
//     if (err) {
//       console.error('Erro ao verificar token:', err);
//       return res.status(403).json({ error: 'Token inválido ou expirado.' });
//     }
//     // req.user = decoded.username;
//     console.log('Token decodificado:', req.user);
//     next();
//   });
// userchamada = decoded.username
// console.log("GET /getviagens chamado pelo utilizador:" + userchamada);

//   if (!req.user || !req.user._id) {
//     console.error("req.user ou req.user._id não está definido.");
//     return res.status(500).json({ error: "Erro interno do servidor. Dados do usuário não disponíveis." });
//   }

//   const userId = req.user._id;
//   console.log("userId obtido do token:", userId);

//   ListaV.listByUser(userId)
//     .then(ListaVs => {
//       console.log("Viagens retornadas:", ListaVs);
//       res.jsonp(ListaVs);
//     })
//     .catch(erro => {
//       console.error("Erro ao obter viagens:", erro);
//       res.status(500).json({ error: erro.message });
//     });
// });

// // Add viagem
// router.post('/addViagem', verifyToken, function(req, res) {
//   const novaViagem = {
//     ...req.body,
//     userId: req.user._id  // Inclua o ID do usuário do token decodificado
//   };

//   ListaV.addViagem(novaViagem)
//     .then(ListaV => {
//       console.log("Viagem adicionada com sucesso:", ListaV);
//       res.jsonp(ListaV);
//     })
//     .catch(erro => {
//       console.log("Erro na inserção da Viagem:", erro);
//       res.status(500).json({ error: erro.message });
//     });
// });

// // Add gasto to viagem
// router.post('/getviagens/:id/add-gasto', verifyToken, function(req, res) {
//   ListaV.addGasto(req.params.id, req.body)
//     .then(viagem => {
//       res.jsonp(viagem);
//     })
//     .catch(erro => {
//       console.log("Erro ao adicionar gasto:", erro);
//       res.status(500).json({ error: erro.message });
//     });
// });

// // POST para excluir uma viagem
// router.post('/deleteViagens/:id', verifyToken, function(req, res) {
//   ListaV.deleteViagem(req.params.id)
//     .then(dados => {
//       res.jsonp(dados);
//     })
//     .catch(erro => {
//       console.log("Erro na eliminação da viagem:", erro);
//       res.status(500).json({ error: erro.message });
//     });
// });


// // router.get('/api/categorias', function(req, res) {
// //   ListaV.categorias()
// //     .then(ListaV => {
// //       res.jsonp(ListaV)
// //     })
// //     .catch(erro => {
// //       res.render('error', {error: erro, message: "Erro na obtenção das categorias"})
// //     })
// // });

// // router.get('/api/categorias/:id/produtos', function(req, res) {
// //   ListaV.prodsByCateg(req.params.id)
// //     .then(ListaV => {
// //       res.jsonp(ListaV)
// //     })
// //     .catch(erro => {
// //       res.render('error', {error: erro, message: "Erro na obtenção das categorias"})
// //     })
// // });

// // // POST: de uma ListaV de compras

// // // POST: de um produto numa ListaV de compras

// // router.post('/api/ListaVs/:id/produtos', function(req, res) {
// //   ListaV.addProduto(req.params.id, req.body)
// //     .then(dados => {
// //       res.jsonp(dados)
// //     })
// //     .catch(erro => {
// //       res.render('error', {error: erro, message: "Erro na inserção de um produto"})
// //     })
// // })

// // // DELETE de um produto numa ListaV de compras

// // router.delete('/api/ListaVs/:id/produtos/:prod', function(req, res) {
// //   ListaV.deleteProduto(req.params.id, req.params.prod)
// //     .then(dados => {
// //       res.jsonp(dados)
// //     })
// //     .catch(erro => {
// //       res.render('error', {error: erro, message: "Erro na inserção de um produto"})
// //     })
// // })


// module.exports = router;
