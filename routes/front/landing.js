var express = require('express')
var router = express.Router()
var controller = require('../../controllers/front/landingCtrl')

router.get('/', controller.index);

router.get('/resultado', controller.findAll);

router.get('/autocomplete', controller.autocomplete);


module.exports = router
