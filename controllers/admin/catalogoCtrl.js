const TelefonoCatalogoModel = require('./../../models/telefonoCatalogoModel')
const path = require('path')
const url = require('./../../helpers/url_helper')
const Crawler = require('crawler')
const request = require('request')
const fs = require('fs')

exports.getTelefono = (req, res) => {
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

  TelefonoCatalogoModel.find(where)
    .limit(50)
    .exec(function (err, docs) {
      if (err) {
        return res.render('404', {error: err})
      }

      return res.render('admin/catalogo/producto_parcial', {productos: docs})
    })
}

exports.createTelefono = (req, res) => {

  let telefono = {}
  let crawler = new Crawler({
    maxConnections: 1,
    callback: function (err, res, cb) {

      if (err) {
        console.log(err)
        cb()
      }
      else {
        let $ = res.$

        let propiedad = {
          versiones: [],
          almacenamiento: {
            capacidad: '',
            um: '',
          },
          pantalla: {
            pulgadas: '',
            resolucion: '',
          },
          camara_principal: {
            mp: '',
            p: ''
          },
          camara_secundaria: {
            mp: '',
            p: ''
          },
          ram: {
            capacidad: '',
            um: ''
          },
          bateria: {
            capacidad: '',
            um: ''
          }
        }

        let versiones = $('h2.tab')
        versiones.each(function () {
          let v = $(this)
          if (v.attr('data-version') != '*')
            propiedad.versiones.push(v.html())
        })
        propiedad.versiones = propiedad.versiones.length > 0 ? propiedad.versiones.join(', ') : ''

        propiedad.sistema_operativo = $('span[data-spec="os-hl"]').html() != undefined
          ? $('span[data-spec="os-hl"]').html()
          : ''

        let red = $('a[data-spec="nettech"]').html()
        propiedad.red = red != undefined ? red : ''

        let hd = $('span[data-spec="storage-hl"]').html()
        if (hd != undefined) {
          hd = hd.split(' ')
          propiedad.almacenamiento.capacidad = hd[0]
        }

        let pantalla = $('span[data-spec="displaysize-hl"]').html()
        if (pantalla != undefined) {
          pantalla = pantalla.replace('"', '')
          propiedad.pantalla.pulgadas = parseFloat(pantalla)
        }

        let resolucion = $('div[data-spec="displayres-hl"]').html()
        if (resolucion != undefined) {
          resolucion = resolucion.split(' ')
          propiedad.pantalla.resolucion = resolucion[0]
        }

        let camara_p = $('span[data-spec="camerapixels-hl"]').html()
        propiedad.camara_principal.mp = camara_p != undefined ? parseFloat(camara_p) : 0

        camara_p = $('div[data-spec="videopixels-hl"]').html()
        propiedad.camara_principal.p = camara_p != undefined ? camara_p : ''

        let ram = $('span[data-spec="ramsize-hl"]').html()
        propiedad.ram.capacidad = ram != undefined ? parseFloat(ram) : 0

        let ram_um = $('.accent-expansion span')
        propiedad.ram.um = 'RAM'
        if (ram_um != undefined) {
          ram_um.each(function () {
            if ($(this).attr('data-spec') != 'ramsize-hl') {
              propiedad.ram.um = $(this).html()
            }
          })
        }

        let bateria = $('span[data-spec="batsize-hl"]').html()
        propiedad.bateria.capacidad = bateria != undefined ? parseFloat(bateria) : 0
        propiedad.bateria.um = 'mAh'

        telefono.propiedad = propiedad

        let download = function (uri, filename, callback) {
          request.head(uri, function (err, res, body) {
            request(uri).pipe(fs.createWriteStream(path.join(__dirname, './../../public/images/productos/' + filename))).on('close', callback)
          })
        }

        let imagen_src = $('div.specs-photo-main').find('img').first().attr('src')
        if (imagen_src != undefined) {
          let filename = imagen_src.split('/')
          filename = filename[filename.length - 1]
          download(imagen_src, filename, function () {
            telefono.imagen = 'images/productos/' + filename
            cb()
          })
        }
        else {
          telefono.imagen = 'images/no-image.png'
          cb()
        }

      }

    }
  })

  TelefonoCatalogoModel.findById(req.params.catalogo_id, function (err, doc) {
    if (err) {
      res.status(500).json({error: err})
    }
    else {
      telefono.marca = doc.marca
      telefono.modelo = doc.modelo
      crawler.queue(doc.link_ref)
    }
  })

  crawler.on('drain', function () {
    res.json({telefono: telefono})
  })

}