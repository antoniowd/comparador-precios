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
})