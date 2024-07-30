var Viagem = require('../models/viagem')


module.exports.list = () => {
    return Viagem
            .find()
            .sort({data:-1})
            .then(resposta => {
                return resposta
            })
            .catch(erro => {
                return erro
            })
}

// module.exports.getViagem = id => {
//     return Viagem.findOne({_id:id})
//             .then(resposta => {
//                 return resposta
//             })
//             .catch(erro => {
//                 return erro
//             })
// }

module.exports.getViagem = id => {
    return Viagem.findById(id).exec();
  };
  

module.exports.addViagem = v => {
    if (typeof v.amount === 'string') {
        v.amount = Number(v.amount);
    }
    if (v.date) {
        v.date = new Date(v.date);
    }
    return Viagem.create(v)
        .then(resposta => {
            console.log("Resposta do banco de dados:", resposta);
            return resposta;
        })
        .catch(erro => {
            console.log("Erro ao criar viagem:", erro);
            return erro;
        });
}

// module.exports.updateViagem = l => {
//     return Viagem.updateOne({_id:l._id}, l)
//             .then(resposta => {
//                 return resposta
//             })
//             .catch(erro => {
//                 return erro
//             })
// }

module.exports.deleteViagem = (id) => {
    return Viagem.deleteOne({ _id: id })
      .then(resposta => {
        if (resposta.deletedCount === 0) {
          // Se nada foi deletado, a viagem não foi encontrada
          throw new Error('Viagem não encontrada.');
        }
        return resposta;
      })
      .catch(erro => {
        // Se houver um erro, retornamos o erro para ser tratado na rota
        throw erro;
      });
  }


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