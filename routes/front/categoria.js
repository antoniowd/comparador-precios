var express = require('express')
var router = express.Router()
var controller = require('../../controllers/front/categoriaCtrl')

router.get('/:slug', controller.findAll);

router.put('/change_view/:view', controller.changeView)

module.exports = router
