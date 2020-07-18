const OfertaModel = require('../../models/ofertaModel')
const SitioModel = require('../../models/sitioModel')
const CurrencyModel = require('../../models/currencyModel')
const ProductoModel = require('../../models/productoModel')
const categorias = require('../../config/categorias')
const paises = require('../../config/paises')
const config = require('../../config/config')
const async = require('async')

exports.findAll = (req, res) => {
  let counter = 2
  let data = {
    categorias: categorias,
    sitio_id: req.query.sitio_id ? req.query.sitio_id : '',
    categoria_ref: req.query.categoria ? req.query.categoria : '',
  }

  let where = {
    status: {$ne: -1}
  }

  if(data.sitio_id != '')
    where.sitio = data.sitio_id
  else
    where.sitio = null

  if(data.categoria_ref != '')
    where.categoria_ref = data.categoria_ref

  SitioModel.find({status: {$ne: -1}}, (err, sitios) => {
    if (err) {
      return res.render('admin/404', {error: err})
    }

    data.sitios = sitios
    render(--counter)
  })

  OfertaModel.find(where).populate('sitio').exec(function (err, ofertas) {
    if (err) {
      return res.render('admin/404', {error: err})
    }

    data.ofertas = ofertas
    render(--counter)
  })

  let render = function (c) {

    if (c <= 0) {
      return res.render('admin/oferta_precio/index', data)
    }
  }
}

exports.actualizarPrecio = (req, res) => {
  let id = req.body.id
  let precio = req.body.precio
  let costo_envio = req.body.costo_envio
  let currency = req.body.currency
  let oferta = {precio_original: precio, costo_envio_original: costo_envio, updated: new Date()}

  let iteratee = function (producto, cb) {
    ProductoModel.setReferencePricesById(producto._id, function (err) {
      if (err) {
        return cb(err)
      }

      return cb(null)
    })
  }

  CurrencyModel
    .findOne({from: currency, to: paises[config.pais_defecto].moneda_codigo})
    .exec(function (err, curr) {
      if (err) {
        return res.status(500).json({error: err})
      }

      if (curr == null) {
        oferta.precio = oferta.precio_original
        oferta.costo_envio = oferta.costo_envio_original
        oferta.cambio = 1
      }
      else {
        oferta.precio = oferta.precio_original * curr.val
        oferta.costo_envio = oferta.costo_envio_original * curr.val
        oferta.cambio = curr.val
      }

      OfertaModel.findOneAndUpdate({_id: id}, oferta, {new: true}, function (err, doc) {
        if (err) {
          return res.status(500).json({error: err})
        }

        ProductoModel.find({ofertas: {$in: [id]}}, function (err, productos) {
          if (err) {
            return res.status(500).json({error: err})
          }

          async.eachLimit(productos, 5, iteratee, function (err) {
            if (err) {
              return res.status(500).json({error: err})
            }

            return res.json({oferta: doc})
          })

        })

      })

    })

}
