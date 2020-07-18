$(function () {

  $('#actualizar-btn').on('click', function () {
    var btn = $(this)
    btn.attr('disabled', 'disabled')
    $('#text-result').html('')

    $.ajax({
      url: $('#site_url').val() + 'admin/scraper/ofertas',
      type: 'GET',
      data: {
        sitio_id: $('#sitio').val()
      },
      success: function (data) {

        if (data.ofertas.length > 0) {
          $('#text-result').append('<div>Se han encontrado ' + data.ofertas.length + ' ofertas para actualizar</div>')
        }
        else {
          $('#text-result').append('<div>' + data.msg + '</div>')
        }

        async.eachLimit(data.ofertas, 1, actualizarOferta, function (err) {
          if (err) {
            console.log(err)
          }

          btn.removeAttr('disabled')
          $('#text-result').append('<div>Actualizacion finalizada</div>')
        })

      },
      error: function (data) {
        btn.removeAttr('disabled')
        alert('Error interno')
      }
    })

  })
})

function actualizarOferta (o, cb) {

  $('#text-result').append('<div class="text-info">Actualizando: ' + o.descripcion + '</div>')
  $.ajax({
    url: $('#site_url').val() + 'admin/scraper',
    type: 'POST',
    data: {
      oferta_id: o._id
    },
    success: function (data) {

      if (data.oferta != undefined) {
        if (data.oferta.status == 1)
          $('#text-result').append('<div class="text-success">Actualizado: ' + data.oferta.descripcion + '</div>')
        else
          $('#text-result').append('<div class="text-warning">No Disponible: ' + data.oferta.descripcion + '</div>')
      }
      else {
        $('#text-result').append('<div class="text-warning">No se ha podido devolver la oferta: ' + o.descripcion + '</div>')
      }

      cb()
    },
    error: function (data) {

      console.log(data)

      $('#text-result').append('<div class="text-danger">ERROR: ' + o.descripcion + '</div>')
      let error = data.error || 'desconocido'
      if (data.responseJSON != undefined)
        error = data.responseJSON.error

      $('#text-result').append('<div class="text-danger">ERROR MOTIVO: ' + error + '</div>')

      cb()
    }
  })

}