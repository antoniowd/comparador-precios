const Fingerprint = require('express-fingerprint')
var cookieSession = require('cookie-session')
const authUser = require('../lib/authUser')

const userSession = require('../lib/userSession')
const url = require('./../helpers/url_helper')

module.exports = function (app) {
  /* ADMIN ROUTES. */

  const admin_path = 'admin'
  app.post(url.siteUrl(admin_path + '/authenticate'), authUser.authenticate())

  app.use(url.siteUrl(admin_path + '/login'), function (req, res) {
    return res.render('admin/login')
  })

  app.get(url.siteUrl(admin_path + '/logout'), (req, res) => {
    req.logout()
    res.redirect(url.siteUrl(''))
  })

  app.use(url.siteUrl(admin_path + '/sitios'), authUser.isLoggedIn, require('./admin/sitio'))
  app.use(url.siteUrl(admin_path + '/ofertas'), authUser.isLoggedIn, require('./admin/oferta'))
  app.use(url.siteUrl(admin_path + '/ofertas_enlazar'), authUser.isLoggedIn, require('./admin/oferta_enlazar'))
  app.use(url.siteUrl(admin_path + '/ofertas_precios'), authUser.isLoggedIn, require('./admin/oferta_precio'))
  app.use(url.siteUrl(admin_path + '/productos'), authUser.isLoggedIn, require('./admin/producto'))
  app.use(url.siteUrl(admin_path + '/catalogos'), authUser.isLoggedIn, require('./admin/catalogo'))
  app.use(url.siteUrl(admin_path + '/scraper'), authUser.isLoggedIn, require('./admin/scraper'))

  app.use(url.siteUrl(admin_path), authUser.isLoggedIn, require('./admin/home'))

  /* FRONTEND ROUTES */

  let frontMiddleware = []

  frontMiddleware.push(cookieSession({
    name: 'comparandoando_session',
    keys: ['12345678']
  }))

  frontMiddleware.push(Fingerprint({
    parameters: [
      Fingerprint.useragent,
      Fingerprint.acceptHeaders,
      Fingerprint.geoip
    ]
  }))

  frontMiddleware.push(userSession)

  app.use(url.siteUrl('c'), frontMiddleware, require('./front/categoria'))
  app.use(url.siteUrl('p'), frontMiddleware, require('./front/producto'))
  app.use(url.siteUrl('oferta'), frontMiddleware, require('./front/oferta'))
  app.use(url.siteUrl('front'), frontMiddleware, require('./front/front'))

  app.use(url.siteUrl(), frontMiddleware, require('./front/landing'))

}
