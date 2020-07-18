const SitioModel = require('../../models/sitioModel')
const Metodos_pagoModel = require('../../models/metodos_pagoModel')
const Agencias_envioModel = require('../../models/agencias_envioModel')
const path = require('path')
const url = require('./../../helpers/url_helper')
const paises = require('./../../config/paises')

exports.findAll = (req, res) => {
  let data = {}

  SitioModel.find({status: {$ne: -1}}).exec((err, sitios) => {
    if (err) {
      return res.render('admin/404', {error: err})
    }

    data.sitios = sitios
    return res.render('admin/sitio/index', data)
  })
}

exports.create = (req, res) => {
  let counter = 2
  let data = {
    title: 'Registrar Sitio',
    paises: paises
  }

  Metodos_pagoModel.find({}, function (err, metodos) {
    if (err) {
      return res.render('admin/404', {error: err})
    }
    data.metodos_pago = metodos
    render(--counter)
  })

  Agencias_envioModel.find({}, function (err, agencias) {
    if (err) {
      return res.render('admin/404', {error: err})
    }
    data.agencias_envio = agencias
    render(--counter)
  })

  let render = (stop) => {

    if (stop <= 0) {
      return res.render('admin/sitio/form', data)
    }
  }

}

exports.update = (req, res) => {
  let counter = 3
  let sitio_id = req.params.sitio_id
  let data = {
    title: 'Editar Sitio',
    paises: paises
  }

  Metodos_pagoModel.find({}, function (err, metodos) {
    if (err) {
      return res.render('admin/404', {error: err})
    }
    data.metodos_pago = metodos
    render(--counter)
  })

  Agencias_envioModel.find({}, function (err, agencias) {
    if (err) {
      return res.render('admin/404', {error: err})
    }
    data.agencias_envio = agencias
    render(--counter)
  })

  SitioModel.findOne({_id: sitio_id}, (err, sitio) => {
    if (err) {
      return res.render('admin/404', {error: err})
    }
    data.sitio = sitio
    render(--counter)
  })

  let render = (stop) => {

    if (stop <= 0) {
      return res.render('admin/sitio/form', data)
    }
  }

}

exports.save = (req, res) => {
  let sitio_id = req.params.sitio_id

  let sitio = {
    codigo: req.body.codigo.toUpperCase(),
    nombre: req.body.nombre,
    url: req.body.url,
    afiliado_tag: req.body.afiliado_tag,
    afiliado_id: req.body.afiliado_id,
    email_cliente: req.body.email_cliente,
    url_contacto: req.body.url_contacto,
    url_condiciones: req.body.url_condiciones,
    pais: paises[req.body.pais],
    rating: req.body.rating,
    metodos_pago: [],
    agencias_envio: [],
    propiedades: [],
    status: req.body.status,
    updated: new Date()
  }

  if (sitio_id == undefined) {

    sitio = new SitioModel(sitio)
    sitio.saveSitio(req, function (err) {
      return render(err)
    })

  }
  else {

    SitioModel.updateSitioById(sitio_id, sitio, req, function (err, sitio) {
      return render(err)
    })

  }

  let render = function (err) {
    if (err) {
      return res.render('admin/404', {error: err})
    }

    return res.redirect(url.siteUrl('admin/sitios'))
  }

}

exports.delete = (req, res) => {
  let sitio_id = req.params.sitio_id

  // En dev los eliminos
  SitioModel.remove({_id: sitio_id}, function (err) {
    if (err) {
      return res.render('admin/404', {error: err})
    }

    return res.redirect(url.siteUrl('admin/sitios'))
  })

  //En produccion se les cambia el estado a -1
  // SitioModel.findByIdAndUpdate(sitio_id, {status: -1}, (err) => {
  //   if (err) {
  //     return res.render('404', {error: err})
  //   }
  //
  //   return res.redirect(url.siteUrl('sitios'))
  // })
}