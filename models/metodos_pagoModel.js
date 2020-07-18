const mongoose = require('mongoose')

let schema = new mongoose.Schema({
  codigo: {type: String, required: true},
  nombre: {type: String, required: true},
  imagen: {type: String, required: true},
}, {collection: 'metodos_pago'})

module.exports = mongoose.model('Metodos_pago', schema)