const OfertaModel = require('../../models/ofertaModel')
const ProductoModel = require('../../models/productoModel')
const SitioModel = require('../../models/sitioModel')
const CurrencyModel = require('../../models/currencyModel')
const path = require('path')
const paises = require('../../config/paises')
const categorias = require('../../config/categorias')
const config = require('../../config/config')
const url = require('./../../helpers/url_helper')

exports.findAll = (req, res) => {
  let counter = 2
  let query = req.query
  let data = {
    query: {}
  }

  data.query.sitio = query.sitio || ''
  data.query.indexado = query.indexado || -1

  SitioModel.find({}).exec(function (err, sitios) {
    if (err) {
      return res.render('admin/404', {error: err})
    }

    data.sitios = sitios
    return render(--counter)
  })

  let where = {status: {$ne: -1}}

  where['sitio'] = data.query.sitio != '' ? data.query.sitio : undefined

  if (data.query.indexado != -1)
    where['indexado'] = data.query.indexado

  OfertaModel.find(where).populate('sitio').exec(function (err, ofertas) {
    if (err) {
      return res.render('admin/404', {error: err})
    }

    data.ofertas = ofertas
    return render(--counter)
  })

  let render = function (c) {
    if (c <= 0) {
      return res.render('admin/oferta/index', data)
    }
  }
}

exports.detallesModal = (req, res) => {
  let data = {}

  OfertaModel.findById(req.params.oferta_id).populate('sitio').exec(function (err, oferta) {
    if (err) {
      return res.render('admin/404', {error: err})
    }

    data.oferta = oferta

    ProductoModel.find({ofertas: {$in: [data.oferta._id]}}).exec(function (err, productos) {
      if (err) {
        return res.render('admin/404', {error: err})
      }

      data.productos = productos
      return res.render('admin/oferta/detalles_modal', data)
    })
  })

}

exports.create = (req, res) => {
  let counter = 1
  let data = {
    title: 'Registrar Oferta',
    paises: paises,
    categorias: categorias,
  }

  SitioModel.findById(req.query.sitio, function (err, sitio) {

    data.sitio = sitio
    render(err, --counter)
  })

  let render = function (err, c) {
    if (err) {
      return res.render('admin/404', {error: err})
    }

    if (c <= 0) {
      return res.render('admin/oferta/form', data)
    }
  }

}

exports.update = (req, res) => {
  let counter = 2
  let oferta_id = req.params.oferta_id
  let data = {
    title: 'Editar Oferta',
    paises: paises,
    categorias: categorias
  }

  OfertaModel.findOne({_id: oferta_id}).populate('sitio').populate('categoria').exec(function (err, oferta) {

    data.sitio = oferta.sitio
    data.oferta = oferta
    render(err, --counter)
  })

  ProductoModel.find({ofertas: {$in: [oferta_id]}}, function (err, productos) {

    data.productos = productos
    render(err, --counter)
  })

  let render = function (err, c) {
    if (err) {
      return res.render('admin/404', {error: err})
    }

    if (c <= 0) {
      return res.render('admin/oferta/form', data)
    }
  }

}

exports.save = (req, res) => {
  let oferta_id = req.params.oferta_id

  let oferta = {
    sitio: req.body.sitio,
    categoria_ref: req.body.categoria,
    descripcion: req.body.descripcion,
    url: req.body.url,
    imagen: req.body.imagen,
    precio_original: parseFloat(req.body.precio_original),
    currency_original: req.body.currency_original,
    costo_envio_original: parseFloat(req.body.costo_envio_original),
    propiedades: [],
    nuevo: req.body.nuevo,
    indexado: req.body.productos_id == undefined ? 0 : 1,
    updated: new Date(),
    status: req.body.status
  }

  CurrencyModel.findOne({
    from: oferta.currency_original,
    to: paises[config.pais_defecto].moneda_codigo
  }, function (err, curr) {
    if (err) {
      return res.render('admin/404', {error: err})
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

    if (oferta_id == undefined) {

      oferta = new OfertaModel(oferta)
      oferta.saveOferta(req.body.productos_id, function (err, doc) {

        return render(err)
      })

    }
    else {

      OfertaModel.updateOfertaById(oferta_id, oferta, req.body.productos_id, function (err, oferta) {

        return render(err)
      })

    }

  })

  let render = function (err) {

    ProductoModel.setAllReferencePrices(function (err) {
      if (err) {
        return res.render('admin/404', {error: err})
      }

      return res.redirect(url.siteUrl('admin/ofertas'))
    })

  }

}

exports.delete = (req, res) => {
  let oferta_id = req.params.oferta_id

  OfertaModel.removeOfertaById(oferta_id, function (err) {
    if (err) {
      return res.render('front/404', {error: err})
    }

    ProductoModel.setAllReferencePrices(function (err) {
      if (err) {
        return res.render('admin/404', {error: err})
      }

      return res.redirect(url.siteUrl('admin/ofertas'))
    })

  })
}

exports.getProducto = (req, res) => {
  let search = req.query.q
  let where = {
    $and: []
  }

  search = search.split(' ')
  search.forEach(function (item) {
    let where_or = {
      $or: [
        {marca: new RegExp(item, 'i')},
        {modelo: new RegExp(item, 'i')}
      ]
    }
    where.$and.push(where_or)
  })

  ProductoModel.find(where)
    .limit(50)
    .exec(function (err, docs) {
      if (err) {
        return res.render('admin/404', {error: err})
      }

      return res.render('admin/oferta/producto_parcial', {productos: docs})
    })
}