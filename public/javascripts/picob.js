$(function() {
  $('.feeling-choices').on('click', function() {
    var $this = $(this);
    var $piece = $this.closest('.piece');

    $.ajax({
      type: 'POST',
      url: '/feeling',
      data: {'date': $piece.attr('date'), 'feeling': $this.text()},
      success: function() {
        alert('success');
      },
      error: function() {
        alert('error');
      }
    });
  });
});
