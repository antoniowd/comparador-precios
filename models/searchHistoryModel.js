const mongoose = require('mongoose')

let schema = new mongoose.Schema({
  ssid: {type: String, required: true},
  value: {type: String, required: true},
  created: {type: Date, required: true, default: new Date()}
}, {collection: 'search_history'})

module.exports = mongoose.model('SearchHistory', schema)