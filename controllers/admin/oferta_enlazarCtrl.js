const OfertaModel = require('../../models/ofertaModel')
const TelefonoModel = require('../../models/productoModel')

exports.findAll = (req, res) => {
  let data = {}
  let counter = 2

  TelefonoModel.find({status: {$ne: -1}}, (err, telefonos) => {
    if (err) {
      return res.render('admin/404', {error: err})
    }

    data.telefonos = telefonos
    render(--counter)
  })

  OfertaModel.find({status: {$ne: -1}, indexado: 0}).populate('sitio').exec(function (err, ofertas) {
    if (err) {
      return res.render('admin/404', {error: err})
    }

    data.ofertas = ofertas
    render(--counter)
  })

  let render = function (c) {

    if (c <= 0) {
      return res.render('admin/oferta_enlazar/index', data)
    }
  }
}

exports.getTelefono = (req, res) => {
  let data = {}
  TelefonoModel.findById(req.params.telefono_id).populate('ofertas').exec(function(err, telefono){
    if (err) {
      return res.render('admin/404', {error: err})
    }

    data.telefono = telefono
    return res.render('admin/oferta_enlazar/telefono_parcial', data)
  })

}
