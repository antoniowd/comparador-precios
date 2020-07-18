const mongoose = require('mongoose')

let schema = new mongoose.Schema({
  nombre: {type: String, required: true},
  correo: {type: String, required: true},
  contenido: {type: String, required: true},
  status: {type: Number, required: false, default: 0},
  created: {type: Date, required: true, default: new Date()}
}, {collection: 'mensajes'})

module.exports = mongoose.model('Mensaje', schema)