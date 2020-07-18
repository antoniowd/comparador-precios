import $ from 'jquery'

// Bootstrap dependencies
import 'bootstrap/js/src/util'
import 'bootstrap/js/src/modal'
import 'bootstrap/js/src/alert'

//jquery ui autocomplete dependencies
import 'jquery-ui/ui/core'
import 'jquery-ui/ui/widget'
import 'jquery-ui/ui/position'
import 'jquery-ui/ui/widgets/menu'
import 'jquery-ui/ui/widgets/autocomplete'

import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faHome } from '@fortawesome/free-solid-svg-icons/faHome'
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch'
import { faFilter } from '@fortawesome/free-solid-svg-icons/faFilter'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope'
import { faTh } from '@fortawesome/free-solid-svg-icons/faTh'
import { faList } from '@fortawesome/free-solid-svg-icons/faList'
import { faStar } from '@fortawesome/free-solid-svg-icons/faStar'
import { faStarHalfAlt } from '@fortawesome/free-solid-svg-icons/faStarHalfAlt'
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons/faStar'

library.add(faHome, faSearch, faPlus, faStar, farStar, faStarHalfAlt, faEnvelope, faTh, faList, faFilter)
dom.i2svg()

import 'jquery-ui/themes/base/core.css'
import 'jquery-ui/themes/base/menu.css'
import 'jquery-ui/themes/base/autocomplete.css'

$(function () {

  $("#preloader").fadeOut("slow");

  $('#search').autocomplete({
    autoFocus: false,
    source: function (request, response) {

      $.ajax({
        url: $('#site_url').val() + 'autocomplete',
        dataType: 'json',
        data: {
          term: request.term
        },
        success: function (data) {
          response(data)
        }
      })
    },
    minLength: 2,
    delay: 500,
    select: function (event, ui) {

      if (ui.item.slug) {
        location.href = $('#site_url').val() + 'p/' + ui.item.slug
      }
      else {
        $('#form-search').submit()
      }
    }
  })
    .autocomplete('instance')._renderItem = function (ul, item) {

    var template = ''
    if (item.slug) {
      template += '<div class="p-2 my-2 text-primary">'
      template += '<img src="' + $('#site_url').val() + item.imagen + '" style="width: 40px;" align="top" class="mr-2 float-left">'
      template += item.label
      template += '<br><small class="text-muted">' + item.total_ofertas + ' ' + (item.total_ofertas == 1 ? 'Oferta' : 'Ofertas') + '</small>'
      template += '<div style="clear: both;"></div>'
      template += '</div>'
    }
    else {
      template += '<div class="p-3">' + item.label + '</div>'
    }

    return $('<li>')
      .append(template)
      .appendTo(ul)
  }

  $('#form-search').on('submit', function () {
    if ($('#search').val() == '') {
      return false
    }
  })

  $('#search-icon').on('click', function () {
    $('#form-search').submit()
  })

  $('#form-message').on('submit', function () {

    if ($('#msg_nombre').val() == '') {
      $('#msg_nombre').addClass('is-invalid')
      $('#msg_nombre').focus()
      return false
    }
    else {
      $('#msg_nombre').removeClass('is-invalid')
    }

    if ($('#msg_correo').val() == '') {
      $('#msg_correo').addClass('is-invalid')
      $('#msg_correo').focus()
      return false
    }
    else {
      $('#msg_correo').removeClass('is-invalid')
    }

    if ($('#msg_contenido').val() == '') {
      $('#msg_contenido').addClass('is-invalid')
      $('#msg_contenido').focus()
      return false
    }
    else {
      $('#msg_contenido').removeClass('is-invalid')
    }

    var form = $(this).serialize()
    $('#btn-send-messagge').attr('disabled', 'disabled')

    $.ajax({
      url: $('#site_url').val() + 'front/send_message',
      data: form,
      type: 'POST',
      success: function (data) {

        $('#msg_nombre').val('')
        $('#msg_correo').val('')
        $('#msg_contenido').val('')

        var template = '<div class="alert alert-success auto-dissmis" role="alert">'
        template += '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'
        template += '<span aria-hidden="true">&times;</span>'
        template += '</button>'
        template += 'Gracias por compartir su opinión con nosotros. La tendremos en cuenta para mejorar el servicio.'
        template += '</div>'
        $('#form-message').prepend(template)

        $('.auto-dissmis').delay(5000).slideUp(200, function () {
          $(this).alert('close')
        })
      },
      complete: function () {
        $('#btn-send-messagge').removeAttr('disabled')
      }
    })
    return false
  })
})

