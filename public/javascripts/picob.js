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
      return data !== null && data.feeling !== null;
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

  var model = selectPiece(function(pieces) {
    model = ko.mapping.fromJS({pieces: pieces}, pieceModelMapping);
    ko.applyBindings(model);
    return model;
  });

  $(document).on('click', '.feeling-choices', function() {
    var $this = $(this);
    var $piece = $this.closest('.piece,.empty-piece');
    var $date = $piece.children('.date');
    var $inputFeeling = $piece.find('.input-feeling');
    var feeling = $.trim($this.text());

    $inputFeeling.val($.trim(feeling));
    $inputFeeling.trigger('change');
    $this.parent().css({'display': 'none'});
    $piece.children('.feeling').css({'display': 'block'});

    upsertPiece($date.attr('year'), $date.attr('month'), $date.attr('day'), feeling);
  });


  $(document).on('click', '.edit-link', function() {
    var $this = $(this);
    var $feelingSelector = $this.siblings('.feeling-selector');
    var $feeling = $this.siblings('.feeling');

    $feelingSelector.css({'display': 'block'});
    $feeling.css({'display': 'none'});
  });

  $('#prev-month').on('click', function() {
    $('#list-month li').activePrev();
    selectPiece(function(pieces) {
      ko.mapping.fromJS({pieces: pieces}, model);
    });
  });

  $('#next-month').on('click', function() {
    $('#list-month li').activeNext();
    selectPiece(function(pieces) {
      ko.mapping.fromJS({pieces: pieces}, model);
    });
  });

  $.fn.activePrev = function() {
    $(this).each(function() {
      var $self = $(this);
      if ($self.is('.active') && $self.prev()[0]) {
        $self.removeClass('active').addClass('inactive');
        $self.prev().removeClass('inactive').addClass('active');
        return false;
      }
    })
  }

  $.fn.activeNext = function() {
    $(this).each(function() {
      var $self = $(this);
      if ($self.is('.active') && $self.next()[0]) {
        $self.removeClass('active').addClass('inactive');
        $self.next().removeClass('inactive').addClass('active');
        return false;
      }
    })
  }

  function selectPiece(doSuccess) {
    var $currentYM = $('#list-month .active');
    $.ajax({
      type: 'GET',
      url: '/' + $currentYM.attr('year') + '/' + $currentYM.attr('month'),
      success: function(res) {
        doSuccess(res.pieces);
      },
      error: function() {
      }
    });
  }

  function upsertPiece(year, month, day, feeling) {
    $.ajax({
      type: 'POST',
      url: '/feeling',
      data: {
        'year': year,
        'month': month,
        'day': day,
        'feeling': feeling
      },
      success: function() {
      },
      error: function() {
      }
    });
  }
});
