$(function() {

  var PieceViewModel = function(data) {
    ko.mapping.fromJS(data, {}, this);
    this.date = ko.computed(function() {
      if (data === null) {
        return '';
      }
      return this.year() + '/' + this.month() + '/' + this.day();
    }, this);
    this.isCompleted = ko.computed(function() {
      return data !== null;
    }, this);
  }

  var pieceModelMapping = {
    'pieces': {
      create: function(options) {
        return new PieceViewModel(options.data);
      }
    }
  }

  $(document).on('click', '.feeling-choices', function() {
    var $this = $(this);
    var $piece = $this.closest('.piece');
    var $inputFeeling = $piece.find('.input-feeling');

    $inputFeeling.val($.trim($this.text()));
    $inputFeeling.trigger('change');
    $this.parent().css({'display': 'none'});

//    $.ajax({
//      type: 'POST',
//      url: '/feeling',
//      data: {
//        'year': $piece.attr('year'),
//        'month': $piece.attr('month'),
//        'day': $piece.attr('day'),
//        'feeling': $.trim($this.text())
//      },
//      success: function() {
//        alert('success');
//      },
//      error: function() {
//        alert('error');
//      }
//    });
  });

  $(document).on('click', '.edit-link', function() {
    var $this = $(this);
    var $feelingSelector = $this.siblings('.feeling-selector');
    $feelingSelector.css({'display': 'block'});
  });

  $('body').append('<div class="edit-link">ここをクリック</div>');

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

    var model = ko.mapping.fromJS({pieces: resPieces}, pieceModelMapping);
    ko.applyBindings(model);
  }
});
