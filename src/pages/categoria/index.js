import $ from 'jquery'
import '../layout'
import '../../scss/main.scss'
import '../../scss/categoria.scss'

$(function () {

  $('#filter-btn').on('click', function () {
    $('#filter-modal').modal('show')
  })

  $('input[name="list"]').on('change', function () {
    if ($(this).val() == 'mosaic') {
      $('.product-list').hide()
      $('.product-mosaic').show()
    }
    else {
      $('.product-mosaic').hide()
      $('.product-list').show()
    }

    $.ajax({
      url: $('#site_url').val() + 'c/change_view/' + $(this).val(),
      type: 'PUT',
      success: function(data){

      }
    })
  })

  $('#order').on('change', function () {
    $('#filtro_query').trigger('submit')
  })

  $('#next_page').on('click', function () {
    var page = parseInt($(this).attr('data-page'))
    $('#page').val(page)
  })

  $('#prev_page').on('click', function () {
    var page = parseInt($(this).attr('data-page'))
    $('#page').val(page)
  })

  $('.filter-marca').on('click', function (e) {
    e.preventDefault()
    var elem = $(this)
    var form = $('#filtro_query')
    var input = '<input type="hidden" id="m_' + elem.attr('data-marca') + '" name="marca" value="' + elem.attr('data-marca') + '">'

    if (elem.hasClass('active')) {
      $('.del-filter-marca[data-marca="' + elem.attr('data-marca') + '"]').trigger('click')
    }
    else {
      $('#m_' + elem.attr('data-marca')).remove()
      form.append(input)

      $('#page').val(0)

      form.submit()
    }

  })

  $('.del-filter-marca').on('click', function (e) {
    e.preventDefault()
    var elem = $(this)
    var form = $('#filtro_query')

    $('#m_' + elem.attr('data-marca')).remove()
    $(this).remove()

    $('#page').val(0)

    form.submit()
  })

  $('.filter-precio').on('click', function (e) {
    e.preventDefault()
    var elem = $(this)
    var form = $('#filtro_query')
    var input = '<input type="hidden" id="p_' + elem.attr('data-precio') + '" name="precio" value="' + elem.attr('data-precio') + '">'

    if (elem.hasClass('active')) {
      $('.del-filter-precio[data-precio="' + elem.attr('data-precio') + '"]').trigger('click')
    }
    else {
      $('#p_' + elem.attr('data-precio')).remove()
      form.append(input)

      $('#page').val(0)

      form.submit()
    }

  })

  $('.del-filter-precio').on('click', function (e) {
    e.preventDefault()
    var elem = $(this)
    var form = $('#filtro_query')

    $('#p_' + elem.attr('data-precio')).remove()
    $(this).remove()

    $('#page').val(0)

    form.submit()
  })

  $('#del-filtro').on('click', function (e) {
    e.preventDefault()

    $('input[name="precio"]').remove()
    $('input[name="marca"]').remove()
    $('#filtro_query').submit()
  })

})