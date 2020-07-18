var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
var logger = require('morgan')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
var compression = require('compression')
var helmet = require('helmet')

var Routes = require('./routes')
const config = require('./config/config')
const paises = require('./config/paises')
const authUser = require('./lib/authUser')

mongoose.connect(config.db.host, {
  useNewUrlParser: true
})

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

if (app.get('env') == 'development') {
  app.use(logger('dev'))
}

app.use(compression())
app.use(helmet())
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(fileUpload())

const cookieExpirationDate = new Date()
const cookieExpirationDays = 365
cookieExpirationDate.setDate(cookieExpirationDate.getDate() + cookieExpirationDays)

app.use('/admin', session({
  secret: 'a5eh8475hke9384jfjj34',
  name: 'comparandoAndo_id_admin',
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  proxy: true,
  resave: true,
  saveUninitialized: true,
  cookie: {
    expires: cookieExpirationDate // use expires instead of maxAge
  }
}))

app.use('/admin', authUser.init())
app.use('/admin', authUser.session())

Routes(app)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('404')
})

app.locals.PAIS_DEFECTO = paises[config.pais_defecto]
app.locals.date = require('date-and-time')
app.locals.siteUrl = require('./helpers/url_helper').siteUrl

module.exports = app
