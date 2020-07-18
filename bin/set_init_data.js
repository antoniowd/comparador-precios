const mongoose = require('mongoose')
const config = require('../config/config')
const CurrencyModel = require('../models/currencyModel')

mongoose.connect(config.db.host, {
  useNewUrlParser: true
})

CurrencyModel.remove({}, function (err) {
  if (err) {
    return console.log(err)
  }
  else {
    CurrencyModel.insertMany([
      {
        from: 'PEN', to: 'USD', val: 0, status: 1
      },
      {
        from: 'USD', to: 'PEN', val: 0, status: 1
      }
    ], function (err, docs) {
      if (err) {
        return console.log(err)
      }
      else {
        return console.log(docs)
      }
    })
  }
})
