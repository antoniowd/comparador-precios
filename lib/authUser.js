const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const helper = require('../helpers/url_helper')

passport.use(new LocalStrategy(
  function (username, password, done) {

    console.log(username)
    if (username == 'ca_admin') {

      if (password == 'Haley880308') {
        return done(null, true)
      }
      else {
        return done(null, {user: 'ComparandoAndo'})
      }
    }
    else {
      return done(null, false)
    }
  }
))

passport.serializeUser(function (user, done) {
  return done(null, {user: 'ComparandoAndo'})
})

passport.deserializeUser(function (id, done) {
  return done(null, {user: 'ComparandoAndo'})
})

exports.init = () => {
  return passport.initialize()
}

exports.session = () => {
  return passport.session()
}

exports.authenticate = () => {
  return (req, res, next) => {

    passport.authenticate('local',
      {
        failureRedirect: helper.siteUrl('admin/login'),
        successRedirect: helper.siteUrl('admin')
      })(req, res, next)

  }
}

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next()

  return res.redirect(helper.siteUrl('admin/login'))
}