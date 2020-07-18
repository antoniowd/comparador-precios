const request = require('request')
const SitioModel = require('../../models/sitioModel')
const OfertaModel = require('../../models/ofertaModel')
const ProductoModel = require('../../models/productoModel')
const CurrencyModel = require('../../models/currencyModel')
const paises = require('../../config/paises')
const config = require('../../config/config')

exports.index = (req, res) => {
  let data = {}

  SitioModel.find({status: 1}).exec(function (err, sitios) {
    if (err) {
      return res.render('admin/404', {error: err})
    }

    data.sitios = sitios
    return res.render('admin/scraper/index', data)

  })

}

exports.getOfertas = (req, res) => {
  let payload = {
    ofertas: [],
    msg: ''
  }
  let sitio_id = req.query.sitio_id

  SitioModel.findById(sitio_id).exec(function (err, sitio) {
    if (err) {
      return res.status(500).json({error: err.message})
    }

    if (sitio.codigo == 'AMAZON_USA' || sitio.codigo == 'LINIO_PER') {

      OfertaModel.find({sitio: sitio._id}).exec(function (err, ofertas) {
        if (err) {
          return res.status(500).json({error: err.message})
        }
        payload.ofertas = ofertas
        return res.status(200).json(payload)
      })
    }
    else {
      payload.msg = 'Este sitio no tiene un crawler configurado'
      return res.status(200).json(payload)
    }

  })
}

exports.actualizar = (req, res) => {
  let body = req.body
  let payload = {
    msg: ''
  }

  let oferta_id = req.body.oferta_id

  OfertaModel.findOneAndUpdate({_id: oferta_id}, {status: 0}, {'new': true}).populate('sitio').exec(function (err, oferta) {
    if (err) {
      return res.status(500).json({error: err.message})
    }
//138.68.227.223
    const options = {
      url: 'http://localhost:4000/api/?sitecode=' + oferta.sitio.codigo.toLowerCase() + '&url=' + encodeURIComponent(oferta.url),
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'User-Agent': 'app-comparandoando'
      }
    }

    request(options, function (err, resp, body) {
      if (err) {
        console.log(err)
        return res.status(500).json({error: 'Error actualizando el sistema', oferta: oferta})
      }

      let json = {}
      try {
        json = JSON.parse(body)

      }
      catch (err) {
        console.log(err)
        return res.status(500).json({error: 'No se pudo parsear el payload del sitio a un json valido', oferta: oferta})
      }

      let descripcion = json.description != undefined ? json.description : ''
      let precio = json.price != undefined && json.price > 0 ? parseFloat(json.price) : -1
      let costo_envio = json.shipping != undefined && json.shipping >= 0 ? parseFloat(json.shipping) : -1
      costo_envio = json.shipping == undefined ? oferta.costo_envio_original : costo_envio

      let oferr = {}

      if (precio != -1 && costo_envio >= 0) {

        oferr.precio_original = precio
        oferr.costo_envio_original = costo_envio

        CurrencyModel.findOne({
          from: oferta.currency_original,
          to: paises[config.pais_defecto].moneda_codigo
        }, function (err, curr) {

          if (err) {
            return res.status(500).json({error: err.message, oferta: oferta})
          }

          if (curr == null) {
            oferr.precio = oferr.precio_original
            oferr.costo_envio = oferr.costo_envio_original
            oferr.cambio = 1
          }
          else {
            oferr.precio = oferr.precio_original * curr.val
            oferr.costo_envio = oferr.costo_envio_original * curr.val
            oferr.cambio = curr.val
          }

          oferr.updated = new Date()
          oferr.status = 1
          OfertaModel.findOneAndUpdate({_id: oferta._id}, oferr, {'new': true}, function (err, oferta) {

            return render(err, oferta)
          })
        })

      }

      let render = function (err, oferta) {

        ProductoModel.setAllReferencePrices(function (err) {
          if (err) {
            return res.status(500).json({error: err.message, oferta: oferta})
          }

          return res.status(200).json({oferta: oferta})
        })

      }

    })
  })

}

