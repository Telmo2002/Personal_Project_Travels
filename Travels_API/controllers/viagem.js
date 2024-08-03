// controllers/viagem.js

var Viagem = require('../models/viagem');

// Listar todas as viagens de um usuário específico
module.exports.listByUser = (userID) => {
  console.log('userId recebido:', userID);
  return Viagem
    .find({ userID })  // Filtra as viagens pelo userId
    .sort({ date: -1 })  // Corrigido para 'date'
    .then(resposta => resposta)
    .catch(erro => {
      console.error('Erro na consulta de viagens:', erro);
      throw erro;  // Lance o erro para tratamento na rota
    });
};


// Obter uma viagem específica pelo ID
module.exports.getViagem = id => {
    return Viagem.findById(id).exec();
};

// Adicionar uma nova viagem associada a um usuário específico
module.exports.addViagem = v => {
  if (typeof v.amount === 'string') {
      v.amount = Number(v.amount);
  }
  if (v.date) {
      v.date = new Date(v.date);
  }
  return Viagem.create(v)
      .then(resposta => {
          return resposta;
      })
      .catch(erro => {
          throw erro; // Lance o erro para tratamento na rota
      });
};

// Deletar uma viagem específica pelo ID
module.exports.deleteViagem = (id) => {
    return Viagem.deleteOne({ _id: id })
      .then(resposta => {
        if (resposta.deletedCount === 0) {
          throw new Error('Viagem não encontrada.');
        }
        return resposta;
      })
      .catch(erro => {
        throw erro; // Lance o erro para tratamento na rota
      });
};

// Adicionar um gasto a uma viagem específica
module.exports.addGasto = (id, gasto) => {
    return Viagem.findByIdAndUpdate(
      id,
      { $push: { gastos: gasto } },
      { new: true, useFindAndModify: false }
    ).exec();
};



// module.exports.categorias = () => {
//     return Viagem.distinct("produtos.categoria")
//             .then(resposta => {
//                 return resposta
//             })
//             .catch(erro => {
//                 return erro
//             })
// }

// module.exports.prodsByCateg = (id) => {
//     return Viagem.aggregate([{$unwind: "$produtos"}, {$match: {"produtos.categoria": id}}, {$project: {"produtos.designacao":1, _id:0}}])
//             .then(resposta => {
//                 return resposta
//             })
//             .catch(erro => {
//                 return erro
//             })
// }

// module.exports.addProduto = (id, prod) => {
//     return Viagem.updateOne({_id:id}, 
//                 { $push: { "produtos": prod } })
//             .then(resposta => {
//                 return resposta
//             })
//             .catch(erro => {
//                 return erro
//             })
// }

// module.exports.deleteProduto = (id, prod) => {
//     return Viagem.updateOne({ "_id": id }, 
//                 { $pull: {"produtos": {_id: prod}}})
//             .then(resposta => {
//                 return resposta
//             })
//             .catch(erro => {
//                 return erro
//             })
// }