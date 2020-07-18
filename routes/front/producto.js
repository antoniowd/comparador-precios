var express = require('express')
var router = express.Router()
var controller = require('../../controllers/front/productoCtrl')

router.get('/:slug', controller.findOne);

module.exports = router
