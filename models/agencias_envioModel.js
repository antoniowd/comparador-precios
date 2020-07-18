const mongoose = require('mongoose')

let schema = new mongoose.Schema({
  codigo: {type: String, required: true},
  nombre: {type: String, required: true},
  sitio: {type: String, required: false},
  imagen: {type: String, required: true},
}, {collection: 'agencias_envio'})

module.exports = mongoose.model('Agencias_envio', schema)