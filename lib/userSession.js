// const dateTime = require('date-and-time')

module.exports = (req, res, next) => {

  req.session.ssid = req.fingerprint.hash
  // req.session.elapsed_login = dateTime.subtract(new Date(), new Date(req.session.login)).toSeconds()
  req.session.last_login = new Date()
  req.session.product_view = req.session.product_view || 'mosaic'

  next()

}