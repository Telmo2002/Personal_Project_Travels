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
    gastos:[gastoSchema],
    userID: String,
}, { collection: 'viagens' }); // Nome da coleção especificado aqui

module.exports = mongoose.model('viagem', viagemSchema)