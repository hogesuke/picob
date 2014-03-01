$(function() {

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

  function getUserSeq() {
    var pathname = window.location.pathname;
    if (pathname.match(/^\/([0-9]{1,9})\/calendar\/[0-9]{4}\/[0-9]{2}\/?$/)) {
      return RegExp.$1
    }
    throw 'invalid url';
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
