let async = require('async')
const config = require('../config/config')
const mongoose = require('mongoose')
const OfertaModel = require('../models/ofertaModel')
const SitioModel = require('../models/sitioModel')
const CurrencyModel = require('../models/currencyModel')
const ProductoModel = require('../models/productoModel')
const paises = require('../config/paises')

// let args = require('yargs').argv
// return 0

mongoose.connect(config.db.host, {
  useNewUrlParser: true
})
let capabilities = {
  browserName: 'firefox',
  version: '62.0',
  enableVNC: false,
}
const max_conection = 1

let iteratee = function (doc, cb) {

  let run = async function (cb1) {

    let payload = {
      status: -1,
      product: {}
    }
    try {
      console.log('Updating ' + doc.descripcion)
      let site_codes = [
        'amazon_usa',
        'linio_per',
        'loginstore_per',
        'ripley_per',
        'sagafalabella_per',
        'smartphones_per'
      ]

      if (site_codes.indexOf(doc.sitio.codigo.toLowerCase()) > -1) {

        payload = await require('../crawlers/sites/' + doc.sitio.codigo.toLowerCase()).getPrices(doc, capabilities)
        /*
         Payload object
         - status: 1 => OK, 0 => No Actualizar
         - product:
         description: Descripcion del producto
         price: precio actualizado
         shipping: costo de envio (X >= 0 => costo, -1 => No actualizar costo)
         */
      } else {
        console.log('WARNING: No site code information. ' + doc.sitio.nombre)
      }
    }
    catch (e) {
      return cb1(e)
    }

    let product = {}
    if (payload.status == 1) {
      product.descripcion = payload.product.description
      product.precio_original = parseFloat(payload.product.price)
      if (payload.product.shipping >= 0)
        product.costo_envio_original = parseFloat(payload.product.shipping)
    }

    return cb1(null, product)
  }

  run(function (err, p) {

    if (err) {
      console.log(err)
      return cb()
    }
    else {
      if (p.precio_original != undefined) {

        CurrencyModel.findOne({
          from: doc.currency_original,
          to: paises[config.pais_defecto].moneda_codigo
        }, function (err, curr) {

          if (err) {
            console.log(err)
            return cb()
          }

          if (curr == null) {
            p.precio = p.precio_original
            if (p.costo_envio_original != undefined)
              p.costo_envio = p.costo_envio_original
            p.cambio = 1
          }
          else {
            p.precio = p.precio_original * curr.val
            if (p.costo_envio_original != undefined)
              p.costo_envio = p.costo_envio_original * curr.val
            p.cambio = curr.val
          }

          p.status = 1
          p.actualizando = 0
          p.updated = new Date()

          OfertaModel.findByIdAndUpdate(doc._id, p, function (err) {
            if (err) {
              console.log(err)
              return cb()
            }

            console.log(p.descripcion + ' - ' + doc.sitio.nombre)
            console.log('URL: ' + doc.url)
            console.log('PRICE: ' + p.precio_original)
            if (p.costo_envio_original != undefined)
              console.log('SHIP: ' + p.costo_envio_original)
            else
              console.log('SHIP = No updated Shipment information')

            console.log('------------------------------------------------------------------------------------')

            ProductoModel.setAllReferencePrices(function (err) {
              if (err) {
                console.log(err)
              }

              return cb()
            })

          })

        })

      }
      else {

        OfertaModel.findByIdAndUpdate(doc._id, {status: 0, actualizando: 0}, function (err) {
          if (err) {
            console.log(err)
            return cb()
          }

          console.log(doc.descripcion + ' - ' + doc.sitio.nombre)
          console.log('URL: ' + doc.url)
          console.log('NO UPDATED')

          console.log('------------------------------------------------------------------------------------')

          ProductoModel.setAllReferencePrices(function (err) {
            if (err) {
              console.log(err)
            }

            return cb()
          })
        })

      }
    }

  })

}

function start () {

  OfertaModel.find({actualizando: 1}).populate('sitio').sort({'descripcion': 1}).exec(function (err, docs) {
    if (err) {
      return console.log(err)
    }

    if (docs.length > 0) {
      async.eachLimit(docs, max_conection, iteratee, function (err) {

        if (err) {
          console.log(err)
        }

        console.log('Done...')
      })
    }
    else {
      OfertaModel.updateMany({}, {actualizando: 1}).exec(function (err, rows) {
        if (err) {
          return console.log(err)
        }

        console.log(rows)
        start()
      })
    }

  })
}

start()




