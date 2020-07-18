const ProductoModel = require('../../models/productoModel')
const metas = require('../../config/metas')
const categorias = require('../../config/categorias')

exports.findAll = (req, res) => {
  let counter = 3
  let slug = req.params.slug
  let query = req.query

  let limit = 20
  let data = {
    title: 'ComparandoAndo',
    meta_descripcion: metas.categoria_description,
    query: {}
  }

  let render = function (c) {
    if (c <= 0) {
      return res.render('front/categoria/index', data)
    }
  }

  data.query.list = query.list || (req.session.product_view || 'mosaic')
  req.session.product_view = data.query.list

  data.query.order = query.order || '1'
  data.query.page = parseInt(query.page || 0)

  data.query.marca = []
  if (query.marca && typeof(query.marca) == 'string') {
    data.query.marca.push(query.marca)
  }
  else {
    if (query.marca)
      data.query.marca = query.marca
  }

  data.query.precio = []
  if (query.precio && typeof(query.precio) == 'string') {
    data.query.precio.push(query.precio)
  }
  else {
    if (query.precio)
      data.query.precio = query.precio
  }

  let $sort = {}
  if (data.query.order == '1') {
    $sort = {'points': -1}
  }
  if (data.query.order == '2') {
    $sort = {'precios.0': 1}
  }
  if (data.query.order == '3') {
    $sort = {'precios.0': -1}
  }

  let where = {'categoria.slug': slug, 'precios.0': {'$exists': true}}

  where['$and'] = []
  if (data.query.marca.length > 0) {
    where['$and'].push({'marca': {$in: data.query.marca}})
  }

  var precio_where = {}
  if (data.query.precio.length > 0) {
    precio_where['$or'] = []
    data.query.precio.forEach(function (precio) {
      var p = precio.split('-')
      if (p[1] != 0) {
        precio_where['$or'].push({$and: [{'precios.0': {$gt: parseInt(p[0])}}, {'precios.0': {$lt: parseInt(p[1])}}]})
      }
      else {
        precio_where['$or'].push({$and: [{'precios.0': {$gte: parseInt(p[0])}}]})
      }

    })

    where['$and'].push(precio_where)
  }

  if (where['$and'].length == 0)
    delete where['$and']

  // Total de productos para el paginado
  ProductoModel.count(where, function (err, c) {
    let total_pages = 0
    if (c > limit) {
      total_pages = parseInt(c / limit)
      if (total_pages * limit < c)
        total_pages++
    }

    data.query.next_page = ((data.query.page + 1) < total_pages) ? data.query.page + 1 : -1
    data.query.prev_page = data.query.page == 0 ? -1 : data.query.page - 1
    data.query.total_pages = total_pages
    data.query.total_productos = c

    return render(--counter)
  })

  // Filtro los productos qe pertenecen a la categoria
  ProductoModel.find(where)
    .sort($sort)
    .skip(data.query.page >= 1 ? data.query.page * limit : 0)
    .limit(limit)
    .exec(function (err, productos) {
      if (err) {
        return res.render('front/404', {error: err})
      }

      if (productos.length == 0) {
        for (key in categorias) {
          if (categorias[key].slug == slug)
            data.categoria = categorias[key]
        }
      }
      else {
        data.categoria = productos[0].categoria
      }

      data.title = 'Comparar precios ' + data.categoria.nombre.toLowerCase() + ' - ComparandoAndo'
      data.productos = productos
      data.precios = [
        {_id: '0-500'},
        {_id: '500-1000'},
        {_id: '1000-1500'},
        {_id: '2000-0'},
      ]
      return render(--counter)
    })

  // Filtro las marcas para el filtro left
  ProductoModel.aggregate([
    {
      $match: {'categoria.slug': slug, 'precios.0': {'$exists': true}}
    },
    {
      $group: {
        _id: '$marca',
        count: {$sum: 1}
      }
    },
    {$sort: {'_id': 1}}
  ])
    .exec(function (err, marcas) {
      if (err) {
        return res.render('front/404', {error: err})
      }

      data.marcas = marcas
      return render(--counter)
    })

}

exports.changeView = (req, res) => {

  let view = req.params.view
  if (view == 'list' || view == 'mosaic') {
    req.session.product_view = view
    return res.status(200).json({})
  }
  else {
    return res.status(500).json({})
  }

}