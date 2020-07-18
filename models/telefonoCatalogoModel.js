const mongoose = require('mongoose')

let schema = new mongoose.Schema({
  marca: {type: String, required: true},
  modelo: {type: String, required: true},
  link_ref: {type: String, required: true},
  imagen_ref: {type: String, required: true},
  type: {type: Number, required: true, default: 1}
}, {collection: 'telefonos_catalogo'})

module.exports = mongoose.model('TelefonoCatalogo', schema)