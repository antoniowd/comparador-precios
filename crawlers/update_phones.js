//Script para actualizar los modelos, marcas y ficha tecnica de los productos
let Crawler = require('crawler')
let TelefonoCatalogoModel = require('../models/telefonoCatalogoModel')
let fs = require('fs')
let request = require('request')
let path = require('path')
let async = require('async')

const host = 'https://www.gsmarena.com/'
const seed = 'https://www.gsmarena.com/makers.php3'

exports.updatePhones = (done) => {

  getBrands(function (brands) {

    savePhones(brands, function () {

      done()
    })
  })
}

let getBrands = (done) => {

  let brands_seed = []
  let brands = []
  let crawler = new Crawler({
    maxConnections: 1,
    callback: function (err, res, cb) {
      if (err) {
        console.log(err)
      }
      else {
        const $ = res.$
        $('#body > div > div.st-text').find('a').each(function () {
          let a = $(this)
          let name = a.html().split('<br>')

          brands_seed.push({
            name: name[0].toUpperCase(),
            uri: host + a.attr('href')
          })
        })
        cb()
      }
    }
  })

  crawler.queue(seed)

  crawler.on('drain', function () {

    crw.queue(brands_seed)
  })

  let crw = new Crawler({
    maxConnections: 5,
    callback: function (err, res, cb) {
      if (err) {
        console.log(err)
      }
      else {
        const $ = res.$

        brands.push({
          name: res.options.name,
          uri: res.request.href
        })

        $('#body > div > div.review-nav.pullNeg.col.pushT10 > div.nav-pages').find('a').each(function () {
          brands.push({
            name: res.options.name,
            uri: host + $(this).attr('href')
          })
        })

        cb()
      }
    }
  })

  crw.on('drain', function () {

    done(brands)
  })
}

let download = function (uri, filename, callback) {
  request.head(uri, function (err, res, body) {
    request(uri).pipe(fs.createWriteStream(path.join(__dirname, './../public/images/telefonos/' + filename))).on('close', callback)
  })
}

let savePhones = (brands, done) => {

  let crawler = new Crawler({
    rateLimit: 500,
    callback: function (err, res, cb) {
      if (err) {
        console.log(err)
        cb()
      }
      else {

        const $ = res.$
        let links = []
        $('#review-body > div').find('li').each(function () {
          let li = $(this)

          links.push({
            marca: res.options.name,
            modelo: li.find('strong > span').first().html(),
            uri: host + li.find('a').first().attr('href'),
            imagen_ref: $('.makers > ul:nth-child(1) > li:nth-child(1) > a:nth-child(1) > img:nth-child(1)').attr('src')
          })

        })

        async.eachLimit(links, 1, updateCatalogo, function (err) {

          if (err) {
            console.log(err)
          }

          cb()
        })
      }
    }
  })

  crawler.queue(brands)

  crawler.on('drain', function () {

    done()
  })
}

let updateCatalogo = function (link, callback) {
  let catalogo = {
    marca: link.marca,
    modelo: link.modelo,
    link_ref: link.uri,
    imagen_ref: link.imagen_ref,
  }
  TelefonoCatalogoModel.findOneAndUpdate(
    {marca: catalogo.marca, modelo: catalogo.modelo}, catalogo,
    {new: true, upsert: true, setDefaultsOnInsert: true}, function (err, doc) {

      if (err) {
        console.log(err)
      }

      console.log('Updated Phone ' + catalogo.marca + ' ' + catalogo.modelo)
      callback()
    })
}

// let iteratee = function (links, callback) {
//
//   let crawler = new Crawler({
//     rateLimit: 500,
//     callback: function (err, res, cb) {
//       if (err) {
//         console.log(err)
//         cb()
//       }
//       else {
//         let $ = res.$
//
//         let propiedad = {
//           versiones: [],
//           almacenamiento: {},
//           pantalla: {},
//           camara_principal: {},
//           camara_secundaria: {},
//           ram: {},
//           bateria: {}
//         }
//
//         let versiones = $('h2.tab')
//         versiones.each(function () {
//           let v = $(this)
//           if (v.attr('data-version') != '*')
//             propiedad.versiones.push(v.html())
//         })
//
//         propiedad.sistema_operativo = $('span[data-spec="os-hl"]').html() != undefined
//           ? $('span[data-spec="os-hl"]').html()
//           : ''
//
//         let red = $('a[data-spec="nettech"]').html()
//         red = red != undefined ? red.split(' / ') : []
//         propiedad.red = red
//
//         let hd = $('span[data-spec="storage-hl"]').html()
//         if (hd != undefined) {
//           hd = hd.split(' ')
//           propiedad.almacenamiento.capacidad = hd[0]
//         }
//
//         let pantalla = $('span[data-spec="displaysize-hl"]').html()
//         if (pantalla != undefined) {
//           pantalla = pantalla.replace('"', '')
//           propiedad.pantalla.pulgadas = parseFloat(pantalla)
//         }
//
//         let resolucion = $('div[data-spec="displayres-hl"]').html()
//         if (resolucion != undefined) {
//           resolucion = resolucion.split(' ')
//           propiedad.pantalla.resolucion = resolucion[0]
//         }
//
//         let camara_p = $('span[data-spec="camerapixels-hl"]').html()
//         propiedad.camara_principal.mp = camara_p != undefined ? parseFloat(camara_p) : 0
//
//         camara_p = $('div[data-spec="videopixels-hl"]').html()
//         propiedad.camara_principal.p = camara_p != undefined ? camara_p : ''
//
//         let ram = $('span[data-spec="ramsize-hl"]').html()
//         propiedad.ram.capacidad = ram != undefined ? parseFloat(ram) : 0
//
//         let ram_um = $('.accent-expansion span')
//         propiedad.ram.um = 'RAM'
//         if (ram_um != undefined) {
//           ram_um.each(function () {
//             if ($(this).attr('data-spec') != 'ramsize-hl') {
//               propiedad.ram.um = $(this).html()
//             }
//           })
//         }
//
//         let bateria = $('span[data-spec="batsize-hl"]').html()
//         propiedad.bateria.capacidad = bateria != undefined ? parseFloat(bateria) : 0
//         propiedad.bateria.um = 'mAh'
//
//         let telefono = {
//           marca: res.options.marca,
//           modelo: res.options.modelo,
//           link_ref: res.request.href,
//           propiedad: propiedad,
//           updated: new Date()
//         }
//
//         let updateTelefono = function () {
//           TelefonoModel.findOneAndUpdate(
//             {link_ref: telefono.link_ref}, telefono,
//             {new: true, upsert: true, setDefaultsOnInsert: true}, function (err, doc) {
//
//               if (err) {
//                 console.log(err)
//               }
//
//               console.log('Updated Phone ' + telefono.marca + ' ' + telefono.modelo)
//               cb()
//             })
//         }
//
//         let imagen_src = $('div.specs-photo-main').find('img').first().attr('src')
//         if (imagen_src != undefined) {
//           let filename = imagen_src.split('/')
//           filename = filename[filename.length - 1]
//           download(imagen_src, filename, function () {
//             telefono.imagen = 'images/telefonos/' + filename
//             updateTelefono()
//           })
//         }
//         else {
//           telefono.imagen = 'images/no-image.png'
//           updateTelefono()
//         }
//
//       }
//
//     }
//   })
//
//   crawler.queue(links)
//
//   crawler.on('drain', function () {
//     callback()
//   })
// }