var express = require('express')
var router = express.Router()
var controller = require('../../controllers/front/mensajeCtrl')

router.post('/send_message', controller.sendMessage);

module.exports = router
