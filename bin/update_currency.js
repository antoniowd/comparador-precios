const mongoose = require('mongoose')
const request = require('request')
const async = require('async')
const CurrencyModel = require('../models/currencyModel')
const config = require('../config/config')

mongoose.connect(config.db.host, {
  useNewUrlParser: true
})

CurrencyModel.find({}).exec(function (err, currencies) {

  if (err) {
    return console.log(err)
  }

  let iteratee = function (curr, cb) {
    let key = curr.from + '_' + curr.to
    let url = 'http://free.currencyconverterapi.com/api/v5/convert?q=' + key + '&compact=y'
    request(url, function (err, res, body) {
      if (err) {
        console.log(err)
        cb()
      }
      else {
        let json = JSON.parse(body)
        console.log(key + ': ' + json[key].val)
        CurrencyModel.findOneAndUpdate({from: curr.from, to: curr.to}, {val: json[key].val}, function (err) {
          if (err) {
            console.log(err)
            cb()
          }
          else {
            cb()
          }
        })
      }
    })
  }

  async.eachLimit(currencies, 1, iteratee, function (err) {
    if (err) {
      console.log(err)
    }
    console.log('Done...')
    return process.exit()
  })

})

