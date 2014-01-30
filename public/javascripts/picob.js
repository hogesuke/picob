$(function() {

  $('.feeling-choices').on('click', function() {
    var $this = $(this);
    var $piece = $this.closest('.piece');

    $.ajax({
      type: 'POST',
      url: '/feeling',
      data: {
        'year': $piece.attr('year'),
        'month': $piece.attr('month'),
        'day': $piece.attr('day'),
        'feeling': $.trim($this.text())
      },
      success: function() {
        alert('success');
      },
      error: function() {
        alert('error');
      }
    });
  });

  $.ajax({
    type: 'GET',
    url: '/2013/1',
    success: function(res) {
      createPieceModel(res.pieces);
    },
    error: function() {
    }
  });

  function createPieceModel(resPieces) {
    var pieceViewModel = function() {
      var self = this;
      self.pieces = ko.observableArray(resPieces);
    }
    ko.applyBindings(pieceViewModel);
  }
});
