$(function() {

  var PieceViewModel = function(data) {
    ko.mapping.fromJS(data, {}, this);
    this.date = ko.computed(function() {
      if (data === null) {
        return '';
      }
      return this.day();
    }, this);
    this.isCompleted = ko.computed(function() {
      return data !== null && data.feeling !== null;
    }, this);
    this.isDisabled = ko.computed(function() {
      return data === null;
    }, this);
    this.existFeelingText = ko.computed(function() {
      if (this.isDisabled()) {
        return false;
      }
      return data.feeling_text !== null && typeof data.feeling_text !== "undefined";
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

  var pieceStatus = {
    $piece: undefined,
    year: undefined,
    month: undefined,
    day: undefined,
    feeling: undefined,
    feelingTextId: undefined,
    clear: function() {
      this.$piece = undefined;
      this.year = undefined;
      this.month = undefined;
      this.day = undefined;
      this.feeling = undefined;
      this.feelingTextId = undefined;
    },
    isValid: function() {
      if (!(this.year && this.month && this.day && this.feeling && this.feelingTextId)) {
        return false;
      }
      if (this.year.match(/20[1-9][0-9]/) == null) {
        return false;
      }
      if (this.month.match(/[0,1][0-9]|[1-9]/) == null) {
        return false;
      }
      if (this.day.match(/[1-3][0-9]|[1-9]/) == null) {
        return false;
      }
      if (this.feeling.match(/[1-3]/) == null) {
        return false;
      }
      if (this.feelingTextId.match(/[0-9a-z]+/) == null) {
        return false;
      }
      return true;
    }
  }

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

    pieceStatus.$piece = $piece;
    pieceStatus.year = $date.attr('year');
    pieceStatus.month = $date.attr('month');
    pieceStatus.day = $date.attr('day');
    pieceStatus.feeling = feeling;
  });

  $('.feeling-text-choices').on('click', function() {
    pieceStatus.feelingTextId = $(this).attr('feeling-text-id');
    pieceStatus.$piece.children('.feeling-text').text($(this).text());
    if (pieceStatus.isValid()) {
      upsertPiece(pieceStatus);
    }
    $.modal.close();
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

  $(document).on('click', '.feeling-choices', function() {
    $('#feeling-text-window').modal();
  });

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

  function upsertPiece(pieceStatus) {
    $.ajax({
      type: 'POST',
      url: '/feeling',
      data: {
        'year': pieceStatus.year,
        'month': pieceStatus.month,
        'day': pieceStatus.day,
        'feeling': pieceStatus.feeling,
        'feeling_text_id': pieceStatus.feelingTextId
      },
      success: function() {
        pieceStatus.clear();
      },
      error: function() {
      }
    });
  }
});
