$(function () {

  $('#telefono_id').on('change', function () {
    var select = $(this)
    $('#telefono_descripcion').html('')

    if (select.val() == '') {
      return false
    }

    $.ajax({
      url: $('#site_url').val() + 'admin/ofertas_enlazar/get_telefono/' + select.val(),
      type: 'GET',
      success: function (data) {
        $('#telefono_descripcion').html(data)
      }
    })
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
