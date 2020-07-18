const mongoose = require('mongoose')
const path = require('path')
const schemas = require('./schemas')

let schema = new mongoose.Schema({
  codigo: {type: String, required: true, unique: true},
  nombre: {type: String, required: true, unique: true},
  url: {type: String, required: true, unique: true},
  afiliado_tag: {type: String, required: true, default: 'utm_source'},
  afiliado_id: {type: String, required: true, default: 'comparandoando'},
  logo: {type: String, required: true},
  email_cliente: {type: String, required: false},
  url_contacto: {type: String, required: false},
  url_condiciones: {type: String, required: false},
  pais: schemas.paisSchema,
  metodos_pagos: [schemas.metodoPagoSchema],
  agencias_envio: [schemas.agenciaEnvioSchema],
  propiedades: [schemas.propiedadSchema],
  rating: {type: Number, require: true, default: 20},
  status: {type: Number, required: true},
  updated: {type: Date, required: true},
  created: {type: Date, required: true, default: new Date()}
})

const mime_types = ['image/png', 'image/jpeg', 'image/gif']

schema.methods.saveSitio = function (req, cb) {
  let self = this

  if (!req.files) {
    return cb({error: {message: 'No files were to uploaded'}})
  }

  let logo_file = req.files.logo
  if (mime_types.indexOf(logo_file.mimetype) === -1) {
    return cb({error: {message: 'Invalid extension ' + logo_file.mimetype}})
  }

  let ext = mime_types[mime_types.indexOf(logo_file.mimetype)].split('/')[1]
  let logo_name = logo_file.md5 + '.' + ext
  self.logo = 'images/logos/' + logo_name

  logo_file.mv(path.join(__dirname, './../public/images/logos/' + logo_name), function (err) {
    if (err) {
      return cb(err)
    }

    self.created = new Date()
    self.save(function (err) {
      if (err) {
        return cb(err)
      }

      return cb(null)
    })

  })

}

schema.statics.updateSitioById = function (id, sitio, req, cb) {
  let self = this

  let updateSitio = () => {
    self.findByIdAndUpdate(id, sitio, (err) => {
      if (err) {
        return cb({error: err})
      }

      return cb(err, sitio)
    })
  }

  if (req.files && req.files.logo) {
    let logo_file = req.files.logo
    if (mime_types.indexOf(logo_file.mimetype) === -1) {
      return cb({error: {message: 'Invalid extension ' + logo_file.mimetype}})
    }
    let ext = mime_types[mime_types.indexOf(logo_file.mimetype)].split('/')[1]
    let logo_name = logo_file.md5 + '.' + ext
    sitio.logo = 'images/logos/' + logo_name

    logo_file.mv(path.join(__dirname, './../public/images/logos/' + logo_name), function (err) {
      if (err) {
        return cb({error: err})
      }
      updateSitio()
    })
  }
  else {
    updateSitio()
  }
}

module.exports = mongoose.model('Sitio', schema)