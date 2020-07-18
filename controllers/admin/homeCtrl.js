const MensajeModel = require('../../models/mensajeModel')

exports.index = (req, res) => {

  let data = {}
  MensajeModel.find({}, function (err, mensajes) {

    if (err) {
      return res.render('admin/404', {error: err})
    }

    data.mensajes = mensajes
    return res.render('admin/mensajes', data)
  })
}