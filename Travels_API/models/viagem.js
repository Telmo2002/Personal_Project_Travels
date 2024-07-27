const mongoose = require('mongoose')

var gastoSchema = new mongoose.Schema({
    name: String,
    amount: Number,
    metodoPag: String
});

var viagemSchema = new mongoose.Schema({
    name: String,
    amount: Number,
    description: String, 
    date: Date,
    gastos:[gastoSchema]
}, { collection: 'viagens' }); // Nome da coleção especificado aqui


// var listaSchema = new mongoose.Schema({
//     _id: String,
//     designacao: String,
//     data: String,
//     produtos: [produtoSchema]
// });

module.exports = mongoose.model('viagem', viagemSchema)