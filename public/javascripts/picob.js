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
    this.isDummy = ko.computed(function() {
      return data === null;
    }, this);
    this.existFeelingText = ko.computed(function() {
      if (this.isDummy()) {
        return false;
      }
      return data.feeling_text !== null && typeof data.feeling_text !== "undefined";
    }, this);
    this.getPieceCss = ko.computed(function() {
      return this.isDummy() ? 'dummy-piece' : this.isCompleted() ? 'piece' : 'empty-piece'
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
    feelingText: undefined,
    feelingTextId: undefined,
    errorMsg: undefined,
    clear: function() {
      this.$piece = undefined;
      this.year = undefined;
      this.month = undefined;
      this.day = undefined;
      this.feeling = undefined;
      this.feelingText = undefined;
      this.feelingTextId = undefined;
    },
    isValid: function() {
      if (!(this.year && this.month && this.day)) {
        return false;
      }
      if (!this.feeling) {
        errorMsg = '気分を選択してください。';
        return false;
      }
      if (!this.feelingTextId) {
        errorMsg = 'もっとも近い感情を選択してください。';
        return false;
      }
      if (this.year.match(/20[1-9][0-9]/) == null) {
        errorMsg = '何かがおかしいのでページをリロードしてください。';
        return false;
      }
      if (this.month.match(/[0,1][0-9]|[1-9]/) == null) {
        errorMsg = '何かがおかしいのでページをリロードしてください。';
        return false;
      }
      if (this.day.match(/[1-3][0-9]|[1-9]/) == null) {
        errorMsg = '何かがおかしいのでページをリロードしてください。';
        return false;
      }
      if (this.feeling.match(/[1-3]/) == null) {
        errorMsg = '何かがおかしいのでページをリロードしてください。';
        return false;
      }
      if (this.feelingTextId.match(/[0-9a-z]+/) == null) {
        errorMsg = '何かがおかしいのでページをリロードしてください。';
        return false;
      }
      return true;
    }
  }

  $(document).on('click', '.piece, .empty-piece', function() {
    var $this = $(this);
    var $piece = $this.closest('.piece,.empty-piece');
    var $date = $piece.children('.date');
    var $feelingText = $piece.children('.feeling-text');
    var $inputFeeling = $piece.find('.input-feeling');
    var $formWindow = $('#form-window');

    pieceStatus.$piece = $piece;
    pieceStatus.feeling = $inputFeeling.val();
    pieceStatus.feelingTextId = $feelingText.attr('feeling-text-id');
    pieceStatus.year = $date.attr('year');
    pieceStatus.month = $date.attr('month');
    pieceStatus.day = $date.attr('day');

    $formWindow.children('#selected-feeling').text(pieceStatus.feeling);
    $formWindow.find('.feeling-text-choices').filter(function() {
      return $(this).is('[feeling-text-id="' + pieceStatus.feelingTextId + '"]');
    }).exclusiveActiveToggle('.feeling-text-choices');
    $formWindow.modal();
  });

  $(document).on('click', '.feeling-choices', function() {
    var feeling = $.trim($(this).text());
    var $selected = $('#selected-feeling');
    $selected.text(feeling);
    pieceStatus.feeling = feeling;
  });

  $('.feeling-text-choices').on('click', function() {
    var $this = $(this);

    $this.exclusiveActiveToggle('.feeling-text-choices');
    pieceStatus.feelingText = $this.text();
    pieceStatus.feelingTextId = $this.attr('feeling-text-id');
  });

  $('#post-button').on('click', function() {
    if (pieceStatus.isValid()) {
      upsertPiece(pieceStatus).done(function() {
        // 登録内容をpieceに反映
        var $inputFeeling = pieceStatus.$piece.find('.input-feeling')
        var $feelingText = pieceStatus.$piece.children('.feeling-text');
        $inputFeeling.val(pieceStatus.feeling);
        $inputFeeling.trigger('change');
        $feelingText.text(pieceStatus.feelingText);
        $feelingText.attr({'feeling-text-id': pieceStatus.feelingTextId});

        // 後片付け
        pieceStatus.$piece.children('.empty-feeling').css({'display': 'none'});
        pieceStatus.clear();
        $.modal.close();
      });
    }
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

  $.fn.exclusiveActiveToggle = function(selector) {
    $(selector).each(function() {
      var $self = $(this);
      if ($self.is('.active')) {
        $self.removeClass('active').addClass('inactive');
      }
    });
    $(this).each(function() {
      $(this).removeClass('inactive').addClass('active');
    });
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

  function upsertPiece(pieceStatus) {
    return $.ajax({
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
      },
      error: function() {
      }
    });
  }
});

/**
 * Facebook OAuthでログインした場合にurlに付与されてしまうハッシュを削除。
 */
if (window.location.hash == "#_=_") window.location.hash = "";
