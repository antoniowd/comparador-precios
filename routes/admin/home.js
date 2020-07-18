const express = require('express');
const routes = express.Router();
const home = require('./../../controllers/admin/homeCtrl')

routes.get('/', home.index);



module.exports = routes;
