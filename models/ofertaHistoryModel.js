const mongoose = require('mongoose')

let schema = new mongoose.Schema({
  ssid: {type: String, required: true},
  oferta: {type: mongoose.Schema.Types.ObjectId, ref: 'Oferta'},
  created: {type: Date, required: true, default: new Date()}
}, {collection: 'oferta_history'})

module.exports = mongoose.model('OfertaHistory', schema)