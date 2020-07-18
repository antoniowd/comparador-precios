const mongoose = require('mongoose')
const schemas = require('./schemas')
const async = require('async')

let schema = new mongoose.Schema({
  categoria: schemas.categoriaSchema,
  descripcion: {type: String, required: true},
  slug: {type: String, required: true, unique: true},
  marca: {type: String, required: true},
  modelo: {type: String, required: false},
  imagen: {type: String, required: true},
  propiedades: [schemas.propiedadSchema],
  ofertas: [{type: mongoose.Schema.Types.ObjectId, ref: 'Oferta'}],
  precios: [Number],
  rating: {type: Number, require: true, default: 20},
  points: {type: Number, require: true, default: 0},
  keywords: {type: String},
  status: {type: Number, required: true, default: 0},
  updated: {type: Date, required: true},
  created: {type: Date, required: true, default: new Date()}
}, {collection: 'productos'})

schema.statics.addOfertaById = function (id, productos_id, cb) {
  let self = this

  self.removeOfertaById(id, function (err) {
    if (err) {
      return cb(err)
    }

    self.update(
      {_id: {$in: productos_id}},
      {$addToSet: {ofertas: id}},
      {'new': true, 'upsert': true, 'multi': true}, function (err, num_rows) {
        if (err) {
          return cb(err)
        }

        self.model('Oferta').findByIdAndUpdate(id, {indexado: 1}, function (err) {
          if (err) {
            return cb(err)
          }

          return cb(null, num_rows)
        })

      })

  })
}

schema.statics.removeOfertaById = function (id, cb) {
  let self = this

  self.update(
    {},
    {$pullAll: {ofertas: [id]}},
    {'new': true, 'upsert': true, 'multi': true}, function (err) {
      if (err) {
        return cb(err)
      }

      self.model('Oferta').findByIdAndUpdate(id, {indexado: 0}, function (err) {
        if (err) {
          return cb(err)
        }

        return cb(null)
      })

    })

}

schema.statics.setReferencePricesById = function (id, cb) {
  let self = this

  self.findById(id).populate('ofertas').exec(function (err, doc) {
    if (err) {
      return cb(err)
    }
    let prices = []

    doc.ofertas.forEach(function (oferta) {
      if (oferta.status == 1)
        prices.push(parseFloat(oferta.precio))
    })

    prices = prices.sort(function (a, b) { return a - b })

    self.update({_id: doc._id}, {precios: prices}, function (err) {
      if (err) {
        return cb(err)
      }

      return cb(null, doc)
    })

  })
}

schema.statics.setAllReferencePrices = function (cb) {
  let self = this

  self.find({}).populate('ofertas').exec(function (err, docs) {
    if (err) {
      return cb(err)
    }

    let iteratee = function (doc, callback) {
      let prices = []

      doc.ofertas.forEach(function (oferta) {
        if (oferta.status == 1)
          prices.push(parseFloat(oferta.precio))
      })

      prices = prices.sort(function (a, b) { return a - b })
      self.findByIdAndUpdate(doc._id, {precios: prices}, function (err) {
        if (err) {
          return callback(err)
        }

        return callback(null)
      })
    }

    async.eachLimit(docs, 5, iteratee, function (err) {
      if (err) {
        return cb(err)
      }

      cb(null)
    })
  })
}

module.exports = mongoose.model('Producto', schema)