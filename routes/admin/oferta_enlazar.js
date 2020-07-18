const express = require('express')
const routes = express.Router()
const controller = require('./../../controllers/admin/oferta_enlazarCtrl')

routes.get('/', controller.findAll)
routes.get('/get_telefono/:telefono_id', controller.getTelefono)

module.exports = routes
