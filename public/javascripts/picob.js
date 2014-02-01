$(function() {

  var PieceViewModel = function(data) {
    ko.mapping.fromJS(data, {}, this);
    this.date = ko.computed(function() {
      if (data === null) {
        return '';
      }
      return this.year() + '/' + this.month() + '/' + this.day();
    }, this);
    this.pieceCss = ko.computed(function() {
      return data === null ? 'empty-piece' : 'piece';
    }, this);
  }

  var pieceModelMapping = {
    'pieces': {
      create: function(options) {
        return new PieceViewModel(options.data);
      }
    }
  }

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
      mappingToPieceModel(res.pieces);
    },
    error: function() {
    }
  });

  function mappingToPieceModel(resPieces) {

    var hoge = ko.mapping.fromJS({pieces: resPieces}, pieceModelMapping);
    ko.applyBindings(hoge);
  }
});
