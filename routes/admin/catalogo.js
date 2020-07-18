const express = require('express')
const routes = express.Router()
const controller = require('./../../controllers/admin/catalogoCtrl')

routes.get('/get_telefono', controller.getTelefono)
routes.get('/crear_telefono/:catalogo_id', controller.createTelefono)

module.exports = routes
