$(function() {

  var pieceStatus = {
    userSeq: undefined,
    year: undefined,
    month: undefined,
    day: undefined,
    feeling: undefined,
    feelingText: undefined,
    token: undefined,
    errorMsg: undefined,
    init: function() {
      var pathname = window.location.pathname;
      if (pathname.match(/^\/([0-9]{1,9})\/entry\/.+$/)) {
        this.userSeq = RegExp.$1;
        var $date = $('#date');
        this.year = $date.attr('year');
        this.month = $date.attr('month');
        this.day = $date.attr('day');
        this.feeling = getFeeling();
        this.feelingText = $('#feeling-text .text').val();
        this.token = $('input[name="_csrf"]').val();
        return;
      }
      throw 'invalid url';
    },
    isValid: function() {
      if (!(this.year && this.month && this.day)) {
        return false;
      }
      if (!this.feeling && !this.feelingTextId) {
        errorMsg = '選択してください。';
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
      if (this.feeling.match(/good|normal|bad/) == null) {
        errorMsg = '何かがおかしいのでページをリロードしてください。';
        return false;
      }
      return true;
    },
    getFeelingString: function() {
      if (this.feeling === 'good') {
        return 'Good! (*´ω｀*)';
      }
      if (this.feeling === 'normal') {
        return 'Normal (´-ω-`)';
      }
      if (this.feeling === 'bad') {
        return 'Bad…_(┐「ε:)_';
      }
    }
  }

  var counter = {
    init: function() {
      var count = $('#feeling-text .text').val().length;
      $('#counter').text(count);
    },
    intervalId: undefined,
    setInterval: function() {
      var id = window.setInterval(this.getFeelingTextCounterFunc(), 100);
      this.intervalId = id;
    },
    clearInterval: function() {
      window.clearInterval(this.intervalId);
    },
    getFeelingTextCounterFunc: function() {
      var $input = $('#feeling-text .text');
      var $counter = $('#counter');
      var prevValue = $input.val();
      $counter.text(prevValue.length);
      return function() {
        var value = $input.val();
        if (prevValue != value) {
          $counter.text(value.length);
        }
        prevValue = value;
      };
    }
  }

  function getFeeling() {
    if ($('#feeling').is('.good')) return 'good';
    if ($('#feeling').is('.normal')) return 'normal';
    if ($('#feeling').is('.bad')) return 'bad';
    return 'none';
  }
  pieceStatus.init();
  counter.init();
  controlDispShareButton();

  $(document).on('click', '.feeling-choices', function() {
    var selectedFeeling = $.trim($(this).attr('feeling'));
    var $feeling = $('#feeling');

    $feeling.removeClass(pieceStatus.feeling);
    $feeling.addClass(selectedFeeling);
    pieceStatus.feeling = selectedFeeling;

    controlDispShareButton();
    
    if (pieceStatus.isValid()) upsertPiece(pieceStatus);
  });

  $('#feeling-text .text').on('change', function() {
    pieceStatus.feelingText = $(this).val();
    upsertPiece(pieceStatus);
  });

  $('#feeling-text .text').on('focus', function() {
    counter.setInterval();
  });

  $('#feeling-text .text').on('blur', function() {
    counter.clearInterval();
  });

  $('.feeling-text-choices').on('click', function() {
    var feelingText = $.trim($(this).text())
    var $feelingText = $('#feeling-text .text');

    $feelingText.val(feelingText);
    pieceStatus.feelingText = feelingText;
    upsertPiece(pieceStatus);
  });

  $('#share-button').on('click', function() {
    var url = 'http://picob.net/' + pieceStatus.userSeq + '/entry/'
      + pieceStatus.year + '/' + pieceStatus.month + '/' + pieceStatus.day;
    var editedUrl = 'http://twitter.com/share?url=' + url + '&text=' + getEditShareText()
      + '&related=' + 'hogesuke_1' + '&hashtags=' + 'picob';
    window.open(editedUrl, 'hoge', "width=500, height=260, scrollbars=yes");

    function getEditShareText() {
      var text = '【picob】\n今日の気分　⇒　' + pieceStatus.getFeelingString() + '\n';
      if (pieceStatus.feelingText) {
        text += '今日のひとこと　⇒　' + pieceStatus.feelingText + '\n'
      }
      return encodeURI(text);
    }
  });

  function controlDispShareButton() {
    if($('#feeling').hasClass('none')) {
      $('#share-button').css('display', 'none');
    } else {
      $('#share-button').fadeIn(400).css('display', 'block');
    }
  }

  function upsertPiece(pieceStatus) {
    return $.ajax({
      type: 'POST',
      url: '/' + pieceStatus.userSeq + '/entry/' + pieceStatus.year + '/' + pieceStatus.month + '/' + pieceStatus.day,
      data: {
        'feeling': pieceStatus.feeling,
        'feeling_text': pieceStatus.feelingText,
        '_csrf': pieceStatus.token
      },
      success: function() {
        console.log('success post.');
      },
      error: function(err) {
        window.location = err.responseJSON.path;
      }
    });
  }
});

/**
 * Facebook OAuthでログインした場合にurlに付与されてしまうハッシュを削除。
 */
if (window.location.hash == "#_=_") window.location.hash = "";
