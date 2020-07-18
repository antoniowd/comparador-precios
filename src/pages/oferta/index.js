import $ from 'jquery'
import '../../scss/main.scss'
import '../../scss/oferta.scss'

$(function () {
  $("#preloader").fadeOut("slow");
  setTimeout(function () {
    location.href = $('#oferta_url').val()
  }, 2000)
})
