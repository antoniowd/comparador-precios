const express = require('express')
const routes = express.Router()
const controller = require('./../../controllers/admin/oferta_precioCtrl')

routes.get('/', controller.findAll)
routes.post('/actualizar_precio', controller.actualizarPrecio)

module.exports = routes
