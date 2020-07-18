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

  // $('#detalles_modal').on('hidden.bs.modal', function () {
  //   $('.oferta-precio').off('input')
  //   $('.oferta-precio').off('focus')
  //   $('#detalles_modal').html('')
  //   $('#detalle_js').html('')
  // })

  $('#marca, #oferta').on('change', function () {
    $('#form').submit()
  })
})

function detalles (id) {

  $.ajax({
    url: $('#site_url').val() + 'admin/productos/detalles_modal/' + id,
    type: 'GET',
    success: function (data) {
      $('#detalles_modal').html(data)
      $('#detalles_modal').modal('show')


      // $('#detalle_js').load($('#site_url').val() + 'admin/productos/detalle_js', function () {
      //
      // })
    }
  })

}