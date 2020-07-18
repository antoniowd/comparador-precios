var typingTimer
$(function () {

  $('#producto_search').on('keyup', function () {
    var input = $(this)
    clearTimeout(typingTimer)
    if (input.val().length == 0) {
      $('#producto_content').html('')
      return false
    }

    typingTimer = setTimeout(function () {
      $.ajax({
        url: $('#site_url').val() + 'admin/ofertas/get_producto',
        data: {
          q: input.val(),
          category: $('#categoria_id').val()
        },
        type: 'GET',
        success: function (data) {
          $('#producto_content').html(data)
        }
      })
    }, 500)

  })

  $('#producto_search').on('keydown', function () {
    clearTimeout(typingTimer)
  })

  // $('#descripcion').on('keyup', function () {
  //   $('#producto_search').val($(this).val())
  //   $('#producto_search').trigger('keyup')
  // })

})

