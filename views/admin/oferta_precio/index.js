$(function () {

  $('table').DataTable({
    responsive: true,
    bPaginate: true,
    aLengthMenu: [[10, 25, 50, -1], [10, 25, 50, 'Todos']],
    bInfo: true,
    oLanguage: {
      sUrl: $('#site_url').val() + 'datatable_esp.json'
    }
  })

  $('#sitio_id, #categoria').on('change', function () {
    $('#form').submit()
  })

  $('.oferta-precio').on('input', function () {
    var input = $(this)
    $('#oferta_up_' + input.attr('data-id')).html('Actualizando...')
    if (input.val() != '') {
      $.ajax({
        url: $('#site_url').val() + 'admin/ofertas_precios/actualizar_precio',
        type: 'POST',
        data: {
          id: input.attr('data-id'),
          precio: $('#oferta_' + input.attr('data-id')).val(),
          costo_envio: $('#oferta_envio_' + input.attr('data-id')).val(),
          currency: input.attr('data-currency')
        },
        success: function (data) {
          if (data.oferta != undefined) {
            $('#oferta_up_' + input.attr('data-id')).html(date.format(new Date(data.oferta.updated), 'DD/MM/YYYY HH:mm:ss'))
            $('#oferta_precio_' + input.attr('data-id')).html(data.oferta.precio.toFixed(2) + ' - ' + data.oferta.costo_envio.toFixed(2))
          }
        },
        error: function(){
          $('#oferta_up_' + input.attr('data-id')).html('ERROR')
        }
      })
    }
  })

  $('.oferta-precio').on('focus', function(){
    $(this).select()
  })

})

function detalles (id) {

  $.ajax({
    url: $('#site_url').val() + 'admin/ofertas/detalles_modal/' + id,
    type: 'GET',
    success: function (data) {
      $('#detalles_modal').html(data)
      $('#detalles_modal').modal('show')
    }
  })
}