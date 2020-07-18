const express = require('express')
const routes = express.Router()
const controller = require('./../../controllers/admin/scraperCtrl')

routes.get('/', controller.index)
routes.get('/ofertas', controller.getOfertas)
routes.post('/', controller.actualizar)

module.exports = routes
