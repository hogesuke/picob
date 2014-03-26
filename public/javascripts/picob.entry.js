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
    }
  }

  function getFeeling() {
    if ($('#feeling').is('.good')) return 'good';
    if ($('#feeling').is('.normal')) return 'normal';
    if ($('#feeling').is('.bad')) return 'bad';
    return 'none';
  }
  pieceStatus.init();

  $(document).on('click', '.feeling-choices', function() {
    var selectedFeeling = $.trim($(this).attr('feeling'));
    var $feeling = $('#feeling');

    $feeling.removeClass(pieceStatus.feeling);
    $feeling.addClass(selectedFeeling);
    pieceStatus.feeling = selectedFeeling;
    
    if (pieceStatus.isValid()) upsertPiece(pieceStatus);
  });

  $('.feeling-text-choices').on('click', function() {
    var feelingText = $.trim($(this).text())
    var $feelingText = $('#feeling-text .text');

    $feelingText.val(feelingText);
    pieceStatus.feelingText = feelingText;
    upsertPiece(pieceStatus);
  });

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
