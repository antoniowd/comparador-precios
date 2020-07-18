const mongoose = require('mongoose')

let schemas = {}

schemas.categoriaSchema = new mongoose.Schema({
  nombre: {type: String, required: true},
  slug: {type: String, required: true},
  seccion: {type: String, required: true},
  slug_seccion: {type: String, required: true},
  meta_keywords: {type: String, required: true},
})

schemas.propiedadSchema = new mongoose.Schema({
  nombre: {type: String, required: true},
  valor: {type: String, required: true}
})

schemas.paisSchema = new mongoose.Schema({
  nombre: {type: String, required: true},
  codigo: {type: String, required: true},
  moneda_codigo: {type: String, required: true},
  moneda_nombre: {type: String, required: true},
  moneda_simbolo: {type: String, required: true}
})

schemas.metodoPagoSchema = new mongoose.Schema({
  nombre: {type: String, required: true},
  codigo: {type: String, required: true},
  imagen: {type: String, required: true}
})

schemas.agenciaEnvioSchema = new mongoose.Schema({
  nombre: {type: String, required: true},
  codigo: {type: String, required: true},
  sitio: {type: String, required: true},
  imagen: {type: String, required: true}
})


module.exports = schemas