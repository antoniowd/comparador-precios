$(function () {
  $('.oferta-precio').on('input', function () {
    var input = $(this)

    $('#oferta_up_' + input.attr('data-id')).html('Actualizando...')
    if (input.val() != '') {
      $.ajax({
        url: $('#site_url').val() + 'admin/ofertas_precios/actualizar_precio',
        type: 'POST',
        data: {
          id: input.attr('data-id'),
          precio: input.val(),
          currency: input.attr('data-currency')
        },
        success: function (data) {
          if (data.oferta != undefined) {
            $('#oferta_up_' + input.attr('data-id')).html(date.format(new Date(data.oferta.updated), 'DD/MM/YYYY HH:mm:ss'))
            $('#oferta_precio_' + input.attr('data-id')).html(data.oferta.precio.toFixed(2))
          }
        },
        error: function () {
          $('#oferta_up_' + input.attr('data-id')).html('ERROR')
        }
      })
    }
  })

  $('.oferta-precio').on('focus', function () {
    $(this).select()
  })
})

function unlink (oferta_id) {

  if (!window.confirm('Estas seguro de quitar el enlace de esta oferta'))
    return false;

  $.ajax({
    url: $('#site_url').val() + 'admin/productos/unlink_oferta',
    type: 'POST',
    data: {oferta_id: oferta_id, producto_id: $('#p_id').val()},
    success: function (data) {
      $('#detalles_modal').html(data)
    }
  })
}