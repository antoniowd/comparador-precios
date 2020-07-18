const OfertaModel = require('../../models/ofertaModel')
const OfertaHistoryModel = require('../../models/ofertaHistoryModel')
const url = require('url')

exports.index = (req, res) => {
  let counter = 2
  let oferta_id = req.params.oferta_id
  let data = {
    title: 'ComparandoAndo'
  }

  let oh = new OfertaHistoryModel({
    ssid: req.session.ssid,
    oferta: oferta_id
  })

  oh.save(function (err) {
    return render(--counter)
  })

  OfertaModel.findById(oferta_id).populate('sitio').exec(function (err, oferta) {
    if (err) {
      return res.render('front/404', {error: err})
    }

    data.affiate_url = oferta.url
    if (oferta.sitio.codigo == 'AMAZON_USA') {

      let oferta_url = url.parse(oferta.url, true)
      let pathname = oferta_url.pathname.split('/')
      let producto_id = -1
      if (pathname.indexOf('product') != -1)
        producto_id = pathname.indexOf('product') + 1
      else if (pathname.indexOf('dp') != -1)
        producto_id = pathname.indexOf('dp') + 1

      if (producto_id != -1) {
        data.affiate_url = 'https://www.amazon.com/gp/product/' + pathname[producto_id] + '/?' + oferta.sitio.afiliado_tag + '=' + oferta.sitio.afiliado_id
      }

    }

    data.oferta = oferta
    return render(--counter)
  })

  let render = function (c) {
    if (c <= 0) {

      return res.render('front/oferta/index', data)
    }
  }

}