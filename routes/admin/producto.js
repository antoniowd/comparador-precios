const express = require('express')
const routes = express.Router()
const controller = require('../../controllers/admin/productoCtrl')

routes.get('/', controller.findAll)
routes.get('/nuevo', controller.create)
routes.get('/editar/:producto_id', controller.update)
routes.get('/detalles_modal/:producto_id', controller.detallesModal)
routes.post('/unlink_oferta', controller.unlinkOferta)

routes.post('/guardar', controller.save)
routes.post('/guardar/:producto_id', controller.save)

routes.get('/eliminar/:producto_id', controller.delete)

module.exports = routes
