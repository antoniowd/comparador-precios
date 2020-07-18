const express = require('express')
const routes = express.Router()
const controller = require('./../../controllers/admin/sitioCtrl')

routes.get('/', controller.findAll)
routes.get('/nuevo', controller.create)
routes.get('/editar/:sitio_id', controller.update)

routes.post('/guardar', controller.save)
routes.post('/guardar/:sitio_id', controller.save)

routes.get('/eliminar/:sitio_id', controller.delete)

module.exports = routes
