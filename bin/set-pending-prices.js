const mongoose = require('mongoose')
const config = require('../config/config')
const OfertaModel = require('../models/ofertaModel')

mongoose.connect(config.db.host, {
  useNewUrlParser: true
})

OfertaModel.updateMany({}, {actualizando: 1}).exec(function(err, rows){
  if(err){
    return console.log(err)
  }

  return console.log(rows)

})