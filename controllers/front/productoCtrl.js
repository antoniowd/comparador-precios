const ProductoModel = require('../../models/productoModel')
const metas = require('../../config/metas')
const paises = require('../../config/paises')

exports.findOne = (req, res) => {
  let counter = 1
  let slug = req.params.slug
  let data = {
    title: 'ComparandoAndo',
    meta_descripcion: '',
    pais: paises.PER
  }

  ProductoModel.findOneAndUpdate({status: 1, slug: slug}, {$inc: {points: 0.01}})
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

    })
    .exec(function (err, producto) {
      if (err) {
        return res.render('front/404', {error: err})
      }

      data.title = producto.descripcion.toLowerCase() + ' precios de telefonos celulares - ComparandoAndo'
      data.meta_descripcion = 'Lista de precios de telefonos celulares (' + producto.descripcion.toLowerCase() + ') ' +
        producto.propiedades.map(function (elem) {return elem.valor}).join(', ')

      data.producto = producto
      return render(--counter)
    })

  let render = function (c) {
    if (c <= 0) {
      res.render('front/producto/index', data)
    }
  }

}