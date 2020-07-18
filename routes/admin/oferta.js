const express = require('express')
const routes = express.Router()
const controller = require('./../../controllers/admin/ofertaCtrl')

routes.get('/', controller.findAll)
routes.get('/nuevo', controller.create)
routes.get('/editar/:oferta_id', controller.update)
routes.get('/detalles_modal/:oferta_id', controller.detallesModal)

routes.post('/guardar', controller.save)
routes.post('/guardar/:oferta_id', controller.save)

routes.get('/eliminar/:oferta_id', controller.delete)

routes.get('/get_producto', controller.getProducto)

module.exports = routes
