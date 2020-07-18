const ProductoModel = require('../../models/productoModel')
const path = require('path')
const url = require('./../../helpers/url_helper')
const categorias = require('./../../config/categorias')

exports.findAll = (req, res) => {
  let counter = 2
  let query = req.query
  let data = {
    query: {}
  }

  data.query.marca = query.marca || ''
  data.query.oferta = query.oferta || -1

  ProductoModel.find({status: {$ne: -1}}).distinct('marca').exec((err, marcas) => {
    if (err) {
      return res.render('admin/404', {error: err})
    }

    data.marcas = marcas
    return render(--counter)
  })

  let where = {status: {$ne: -1}}
  if (data.query.marca != '')
    where['marca'] = data.query.marca

  if (data.query.oferta != -1) {
    where['precios.0'] = {'$exists': (data.query.oferta == 1)}
  }

  ProductoModel.find(where).exec((err, productos) => {
    if (err) {
      return res.render('admin/404', {error: err})
    }

    data.productos = productos
    return render(--counter)
  })

  let render = function (c) {
    if (c <= 0) {
      return res.render('admin/producto/index', data)
    }
  }
}

exports.detallesModal = (req, res) => {
  let data = {}

  ProductoModel.findById(req.params.producto_id)
    .populate({
      path: 'ofertas',
      match: {
        status: 1
      },
      populate: {
        path: 'sitio'
      },
      options: {
        sort: {
          'precio': 1
        }
      }

    }).exec(function (err, producto) {
    if (err) {
      return res.render('admin/404', {error: err})
    }

    data.producto = producto
    return res.render('admin/producto/detalles_modal', data)
  })

}

exports.unlinkOferta = (req, res) => {

  let data = {}

  ProductoModel.removeOfertaById(req.body.oferta_id, function (err) {
    if (!err) {

      ProductoModel.setReferencePricesById(req.body.producto_id, function(err){
        if(!err){

          ProductoModel.findById(req.body.producto_id)
            .populate({
              path: 'ofertas',
              match: {
                status: 1
              },
              populate: {
                path: 'sitio'
              },
              options: {
                sort: {
                  'precio': 1
                }
              }

            }).exec(function (err, producto) {
            if (err) {
              return res.render('admin/404', {error: err})
            }

            data.producto = producto
            return res.render('admin/producto/detalles_modal', data)
          })

        }
      })


    }
  })

}

exports.create = (req, res) => {
  let counter = 0
  let data = {
    title: 'Registrar Producto',
    categorias: categorias
  }

  let render = (stop) => {
    if (stop <= 0) {
      return res.render('admin/producto/form', data)
    }
  }

  render(counter)
}

exports.update = (req, res) => {
  let counter = 1
  let producto_id = req.params.producto_id
  let data = {
    title: 'Editar Producto',
    categorias: categorias
  }

  ProductoModel.findOne({_id: producto_id}).exec((err, producto) => {
    if (err) {
      return res.render('admin/404', {error: err})
    }
    data.producto = producto
    render(--counter)
  })

  let render = (stop) => {

    if (stop <= 0) {
      return res.render('admin/producto/form', data)
    }
  }

}

exports.save = (req, res) => {
  let producto_id = req.params.producto_id

  let propiedades = []
  if (req.body.propiedad_nombre) {
    if (typeof(req.body.propiedad_nombre) == 'string') {
      propiedades.push({
        nombre: req.body.propiedad_nombre,
        valor: req.body.propiedad_valor,
      })
    }
    else {
      for (var i = 0; i < req.body.propiedad_nombre.length; i++) {
        propiedades.push({
          nombre: req.body.propiedad_nombre[i],
          valor: req.body.propiedad_valor[i],
        })
      }
    }

  }

  let producto = {
    categoria: categorias[req.body.categoria],
    descripcion: req.body.descripcion,
    slug: req.body.slug,
    marca: req.body.marca,
    modelo: req.body.modelo,
    rating: req.body.rating,
    propiedades: propiedades,
    keywords: req.body.keywords,
    updated: new Date(),
    status: req.body.status
  }

  const mime_types = ['image/png', 'image/jpeg', 'image/gif']

  if (producto_id == undefined) {

    producto.created = new Date()
    producto.precios = []
    producto.ofertas = []

    if (req.files && req.body.imagen == undefined) {

      let logo_file = req.files.imagen
      if (mime_types.indexOf(logo_file.mimetype) === -1) {
        return res.render('admin/404', {error: {message: 'Invalid extension ' + logo_file.mimetype}})
      }
      let ext = mime_types[mime_types.indexOf(logo_file.mimetype)].split('/')[1]
      let logo_name = logo_file.md5 + '.' + ext
      producto.imagen = 'images/productos/' + logo_name

      logo_file.mv(path.join(__dirname, './../../public/images/productos/' + logo_name), function (err) {
        if (err) {
          return res.render('admin/404', {error: err})
        }

        producto = new ProductoModel(producto)

        producto.save((err) => {
          if (err) {
            return res.render('admin/404', {error: err})
          }

          return res.redirect(url.siteUrl('admin/productos'))
        })
      })
    }
    else {
      if (!req.files && req.body.imagen == undefined) {
        return res.render('admin/404', {error: {message: 'No files were to uploaded'}})
      }

      producto.imagen = req.body.imagen
      producto = new ProductoModel(producto)

      producto.save((err) => {
        if (err) {
          return res.render('admin/404', {error: err})
        }

        return res.redirect(url.siteUrl('admin/productos'))
      })

    }

  }
  else {

    let updateProducto = () => {
      ProductoModel.findByIdAndUpdate(producto_id, producto, (err) => {
        if (err) {
          return res.render('admin/404', {error: err})
        }

        return res.redirect(url.siteUrl('admin/productos'))
      })
    }

    if (req.files && req.files.imagen) {
      let logo_file = req.files.imagen
      if (mime_types.indexOf(logo_file.mimetype) === -1) {
        return res.render('admin/404', {error: {message: 'Invalid extension ' + logo_file.mimetype}})
      }
      let ext = mime_types[mime_types.indexOf(logo_file.mimetype)].split('/')[1]
      let logo_name = logo_file.md5 + '.' + ext
      producto.imagen = 'images/productos/' + logo_name

      logo_file.mv(path.join(__dirname, './../../public/images/productos/' + logo_name), function (err) {
        if (err) {
          return res.render('404', {error: err})
        }
        updateProducto()
      })
    }
    else {
      if (req.body.imagen != undefined)
        producto.imagen = req.body.imagen

      updateProducto()
    }

  }

}

exports.delete = (req, res) => {
  let producto_id = req.params.producto_id

  // En dev los eliminos
  ProductoModel.remove({_id: producto_id}, function (err) {
    if (err) {
      return res.render('admin/404', {error: err})
    }

    return res.redirect(url.siteUrl('admin/productos'))
  })

  //En produccion se les cambia el estado a -1
  // ProductoModel.findByIdAndUpdate(producto_id, {status: -1}, (err) => {
  //   if (err) {
  //     return res.render('404', {error: err})
  //   }
  //
  //   return res.redirect(url.siteUrl('productos'))
  // })
}