const MensajeModel = require('../../models/mensajeModel')

exports.sendMessage = (req, res) => {

  let mensaje = new MensajeModel({
    nombre: req.body.msg_nombre,
    correo: req.body.msg_correo,
    contenido: req.body.msg_contenido
  })

  mensaje.save(function(err){
    if(err){
      return res.status(500).json({error: err})
    }

    return res.status(200).json({success: 'ok'})
  })

}