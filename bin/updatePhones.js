const mongoose = require('mongoose')
const config = require('../config/config')

mongoose.connect(config.db.host, {
  useNewUrlParser: true
})

require('../crawlers/update_phones').updatePhones(function () {
  console.log('done')
})