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
      return data !== null && data.feeling !== undefined;
    }, this);
    this.isDisabled = ko.computed(function() {
      return data === null;
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
    var $piece = $this.closest('.piece,.empty-piece');
    var $date = $piece.children('.date');
    var $inputFeeling = $piece.find('.input-feeling');
    var feeling = $this.text();

    $inputFeeling.val($.trim(feeling));
    $inputFeeling.trigger('change');
    $this.parent().css({'display': 'none'});

    upsertPiece($date.attr('year'), $date.attr('month'), $date.attr('day'), feeling);
  });

  function upsertPiece(year, month, day, feeling) {
    $.ajax({
      type: 'POST',
      url: '/feeling',
      data: {
        'year': year,
        'month': month,
        'day': day,
        'feeling': $.trim(feeling)
      },
      success: function() {
        alert('success');
      },
      error: function() {
        alert('error');
      }
    });
  }

  $(document).on('click', '.edit-link', function() {
    var $this = $(this);
    var $feelingSelector = $this.siblings('.feeling-selector');
    $feelingSelector.css({'display': 'block'});
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

    var model = ko.mapping.fromJS({pieces: resPieces}, pieceModelMapping);
    ko.applyBindings(model);
  }
});
