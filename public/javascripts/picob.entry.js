$(function() {

  var pieceStatus = {
    userSeq: undefined,
    year: undefined,
    month: undefined,
    day: undefined,
    feeling: undefined,
    feelingText: undefined,
    feelingTextId: undefined,
    errorMsg: undefined,
    parsePathName: function() {
      var pathname = window.location.pathname;
      if (pathname.match(/^\/([0-9]{1,9})\/entry\/([0-9]{4})\/([0-9]{2})\/([0-9]{2})\/?$/)) {
        this.userSeq = RegExp.$1;
        this.year = RegExp.$2;
        this.month = RegExp.$3;
        this.day = RegExp.$4;
        return;
      }
      throw 'invalid url';
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

  pieceStatus.parsePathName();

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
        //var $inputFeeling = pieceStatus.$piece.find('.input-feeling')
        //var $feelingText = pieceStatus.$piece.children('.feeling-text');
        //$inputFeeling.val(pieceStatus.feeling);
        //$inputFeeling.trigger('change');
        //$feelingText.text(pieceStatus.feelingText);
        //$feelingText.attr({'feeling-text-id': pieceStatus.feelingTextId});

        // 後片付け
        //pieceStatus.$piece.children('.empty-feeling').css({'display': 'none'});
        //pieceStatus.clear();
        //$.modal.close();
      });
    }
  });

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

  function upsertPiece(pieceStatus) {
    return $.ajax({
      type: 'POST',
      url: '/' + pieceStatus.userSeq + '/entry/' + pieceStatus.year + '/' + pieceStatus.month + '/' + pieceStatus.day,
      data: {
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
