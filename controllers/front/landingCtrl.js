const categorias = require('../../config/categorias')
const metas = require('../../config/metas')
const ProductoModel = require('../../models/productoModel')
const SearchHistoryModel = require('../../models/searchHistoryModel')
const url_helper = require('../../helpers/url_helper')
const dateTime = require('date-and-time')

exports.index = (req, res) => {

  let counter = 1
  let data = {
    title: 'Comparador de precios de celulares - ComparandoAndo',
    meta_descripcion: metas.landing_description,
    categorias: categorias
  }

  let where = {'categoria.slug': categorias.celular.slug, 'precios.0': {'$exists': true}}

  ProductoModel.find(where)
    .sort({'points': -1})
    .limit(6)
    .exec(function (err, productos) {
      if (err) {
        return res.render('front/404', {error: err})
      }

      data.productos = productos
      return render(--counter)
    })

  let render = function (c) {
    if (c <= 0) {
      return res.render('front/landing/index', data)
    }
  }
}

exports.findAll = (req, res) => {
  let counter = 5
  let query = req.query

  let limit = 20
  let data = {
    title: 'ComparandoAndo',
    query: {}
  }

  data.query.q = query.q || ''
  if (data.query.q == '')
    res.redirect(url_helper.siteUrl())

  let sh = new SearchHistoryModel({
    ssid: req.session.ssid,
    value: data.query.q
  })

  sh.save(function (err) {

    return render(--counter)
  })

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

  let where = {'precios.0': {'$exists': true}}

  where['$and'] = []
  let q_where = []
  if (data.query.q != '') {

    let search = data.query.q.split(' ')
    search.forEach(function (item) {
      let where_or = {
        $or: [
          {descripcion: new RegExp(item, 'i')},
          {marca: new RegExp(item, 'i')},
          {modelo: new RegExp(item, 'i')},
          {keywords: new RegExp(item, 'i')},
          {'categoria.nombre': new RegExp(item, 'i')},
          {'categoria.slug': new RegExp(item, 'i')},
          {'categoria.seccion': new RegExp(item, 'i')},
          {'categoria.slug_seccion': new RegExp(item, 'i')},
          //{'propiedades.valor': new RegExp(item, 'i')}
        ]
      }
      q_where.push(where_or)
    })

    where['$and'] = q_where
  }

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

      if (data.query.q != '')
        data.title = data.query.q + ' - ComparandoAndo'
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
      $match: {'precios.0': {'$exists': true}, $and: q_where}
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

  // Filtro las marcas para el filtro left
  ProductoModel.aggregate([
    {
      $match: {'precios.0': {'$exists': true}}
    },
    {
      $group: {
        _id: {
          nombre: '$categoria.nombre',
          slug: '$categoria.slug'
        },
        count: {$sum: 1}
      }
    }
  ])
    .exec(function (err, categorias) {
      if (err) {
        return res.render('front/404', {error: err})
      }

      data.categorias = categorias
      return render(--counter)
    })

  let render = function (c) {
    if (c <= 0) {
      return res.render('front/landing/resultado', data)
    }
  }
}

exports.autocomplete = (req, res) => {
  var data = []

  let term = req.query.term || ''
  if (term == '')
    res.status(403).json({error: {message: 'Term string cannot be an empty string'}})

  let where = {'precios.0': {'$exists': true}}
  where['$and'] = []
  let q_where = []
  if (term != '') {

    let search = term.split(' ')
    search.forEach(function (item) {
      let where_or = {
        $or: [
          {descripcion: new RegExp(item, 'i')},
          {marca: new RegExp(item, 'i')},
          {modelo: new RegExp(item, 'i')},
          {keywords: new RegExp(item, 'i')},
          {'categoria.nombre': new RegExp(item, 'i')},
          {'categoria.slug': new RegExp(item, 'i')},
          {'categoria.seccion': new RegExp(item, 'i')},
          {'categoria.slug_seccion': new RegExp(item, 'i')},
          //{'propiedades.valor': new RegExp(item, 'i')}
        ]
      }
      q_where.push(where_or)
    })

    where['$and'] = q_where
  }

  ProductoModel.find(where)
    .sort({'points': -1})
    .limit(5)
    .exec(function (err, productos) {
      if (err) {
        return res.render('front/404', {error: err})
      }

      productos.forEach(function (p) {
        data.push({
          value: p.descripcion,
          label: p.descripcion,
          total_ofertas: p.precios.length,
          imagen: p.imagen,
          slug: p.slug
        })
      })

      res.status(200).json(data)
    })
}