const mongoose = require('mongoose')

let schema = new mongoose.Schema({
  from: {type: String, required: true},
  to: {type: String, required: true},
  val: {type: String, required: true},
  status: {type: Number, required: true},
  updated: {type: Date, required: true, default: new Date()}
}, {collection: 'currency'})

module.exports = mongoose.model('Currency', schema)