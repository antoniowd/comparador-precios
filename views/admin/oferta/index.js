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

  $('#sitio, #indexado').on('change', function () {
    $('#form').submit()
  })

  $('#registrar_oferta').on('click', function(e){
    if($('#sitio').val() == ''){
      alert('Debe seleccionar un sitio')
      e.preventDefault()
      return false
    }
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