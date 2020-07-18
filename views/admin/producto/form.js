var typingTimer
var index = 0
$(function () {

  $('#add_propiedad').on('click', function () {
    add_producto('', '')
  })

  $('#catalogo_search').on('keyup', function () {
    var input = $(this)
    clearTimeout(typingTimer)
    if (input.val().length == 0) {
      $('#producto_content').html('')
      return false
    }

    typingTimer = setTimeout(function () {
      $.ajax({
        url: $('#site_url').val() + 'admin/catalogos/get_telefono',
        data: {
          q: input.val()
        },
        type: 'GET',
        success: function (data) {
          $('#producto_content').html(data)
        }
      })
    }, 500)

  })

  $('#catalogo_search').on('keydown', function () {
    clearTimeout(typingTimer)
  })

  $('#descripcion').on('keyup', function () {
    $('#slug').val(slugify($(this).val()))
  })

})

function add_producto (nombre, valor) {
  var template = '<tr id="row_' + index + '">'

  template += '<td><input class="form-control" name="propiedad_nombre" value="' + nombre + '" required></td>'
  template += '<td><input class="form-control" name="propiedad_valor" value="' + valor + '" required></td>'

  template += '<td><button type="button" class="btn btn-danger btn-sm" onclick="eliminar(' + index + ')">'
  template += '<i class="fa fa-trash"></i></button></td>'

  template += '</tr>'

  $('#propiedades').append(template)
  index++
}

function eliminar (id) {
  $('#row_' + id).remove()
}

function crearTelefono (id) {

  $.ajax({
    url: $('#site_url').val() + 'admin/catalogos/crear_telefono/' + id,
    type: 'GET',
    success: function (data) {
      $('#propiedades').html('')
      $('#categoria').val('celular')
      let telefono = data.telefono
      $('#marca').val(telefono.marca ? telefono.marca : '')
      $('#modelo').val(telefono.modelo ? telefono.modelo : '')
      $('#descripcion').val(telefono.marca ? telefono.marca : '')
      $('#descripcion').val(telefono.modelo ? $('#descripcion').val() + ' ' + telefono.modelo : $('#descripcion').val())
      $('#slug').val(slugify($('#descripcion').val()))
      $('#imagen').attr('type', 'text')
      $('#imagen').val(telefono.imagen ? telefono.imagen : '')
      $('#imagen_vista').html('<img src="' + $('#site_url').val() + telefono.imagen + '">')

      add_producto('Producto', 'Teléfono celular ' + telefono.propiedad.red)
      add_producto('Sistema Operativo', telefono.propiedad.sistema_operativo)
      add_producto('Pantalla', telefono.propiedad.pantalla.pulgadas + ' pulgadas')
      add_producto('Resolución de Pantalla', telefono.propiedad.pantalla.resolucion + ' pixeles')
      add_producto('Camara Principal', telefono.propiedad.camara_principal.mp + ' megapixeles')
      add_producto('Memoria RAM', telefono.propiedad.ram.capacidad)
      add_producto('Almacenamiento', telefono.propiedad.almacenamiento.capacidad)
      add_producto('Bateria', telefono.propiedad.bateria.capacidad + ' mAh')

      $('#keywords').val($('#descripcion').val().toLowerCase())
    }
  })
}