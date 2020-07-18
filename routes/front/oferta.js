var express = require('express')
var router = express.Router()
var controller = require('../../controllers/front/ofertaCtrl')

router.get('/:oferta_id', controller.index);

module.exports = router
