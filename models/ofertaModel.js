const mongoose = require('mongoose')
const schemas = require('./schemas')


let schema = new mongoose.Schema({
  sitio: {type: mongoose.Schema.Types.ObjectId, ref: 'Sitio', required: true},
  descripcion: {type: String, required: true},
  categoria_ref: {type: String},
  url: {type: String, required: true, unique: true},
  imagen: {type: String, required: false},
  precio: {type: Number, require: true},
  cambio: {type: Number, require: true},
  precio_original: {type: Number, require: true},
  currency_original: {type: String, require: true},
  costo_envio_original: {type: Number, require: true, default: 0},
  costo_envio: {type: Number, require: true, default: 0},
  propiedades: [schemas.propiedadSchema],
  nuevo: {type: Number, require: true},
  actualizando: {type: Number, require: true, default: 0},
  indexado: {type: Number, required: true, default: 0},
  status: {type: Number, required: true},
  updated: {type: Date, required: true},
  created: {type: Date, required: true, default: new Date()}
}, {collection: 'ofertas'})

schema.methods.saveOferta = function (productos_id, cb) {
  let self = this

  self.save(function (err, doc) {
    if (err) {
      return cb(err)
    }

    if (productos_id != undefined) {

      self.model('Producto').addOfertaById(doc._id, productos_id, function (err, num_rows) {
        if (err) {
          return cb(err)
        }

        return cb(null, doc)
      })
    }
    else {

      return cb(null, doc)
    }

  })
}

schema.statics.updateOfertaById = function (id, oferta, productos_id, cb) {
  let self = this

  self.findByIdAndUpdate(id, oferta, (err) => {
    if (err) {
      return cb(err)
    }

    if (productos_id != undefined) {

      self.model('Producto').addOfertaById(id, productos_id, function (err, num_rows) {
        if (err) {
          return cb(err)
        }

        return cb(null, oferta)
      })
    }
    else {
      self.model('Producto').removeOfertaById(id, function (err) {
        if (err) {
          return cb(err)
        }
      })

      return cb(null, oferta)
    }

  })
}


schema.statics.removeOfertaById = function (id, cb) {
  let self = this
  let counter = 2

  self.model('Producto').removeOfertaById(id, function (err) {
    if (err) {
      return cb(err)
    }

    return callback(--counter)
  })

  self.remove({_id: id}, function (err) {
    if (err) {
      return cb(err)
    }

    return callback(--counter)
  })

  let callback = function (c) {
    if (c == 0)
      cb(null)
  }

}

module.exports = mongoose.model('Oferta', schema)