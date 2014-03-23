$(function() {

  var pieceStatus = {
    userSeq: undefined,
    year: undefined,
    month: undefined,
    day: undefined,
    feeling: undefined,
    feelingTextId: undefined,
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
      if (typeof this.feelingTextId !== "undefined" && this.feelingTextId.match(/[0-9a-z]+/) == null) {
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
  // TODO socialテスト
  getFriendsFeeling();

  $(document).on('click', '.feeling-choices', function() {
    var selectedFeeling = $.trim($(this).attr('feeling'));
    var $feeling = $('#feeling');

    $feeling.removeClass(pieceStatus.feeling);
    $feeling.addClass(selectedFeeling);
    pieceStatus.feeling = selectedFeeling;
    
    if (pieceStatus.isValid()) upsertPiece(pieceStatus);
  });

  $('.feeling-text-choices').on('click', function() {
    var $this = $(this);
    var $feelingText = $('#feeling-text');

    $feelingText.text($this.text());
    pieceStatus.feelingTextId = $this.attr('feeling-text-id');

    upsertPiece(pieceStatus);
  });

  function upsertPiece(pieceStatus) {
    return $.ajax({
      type: 'POST',
      url: '/' + pieceStatus.userSeq + '/entry/' + pieceStatus.year + '/' + pieceStatus.month + '/' + pieceStatus.day,
      data: {
        'feeling': pieceStatus.feeling,
        'feeling_text_id': pieceStatus.feelingTextId,
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

  function getFriendsFeeling() {
    return $.ajax({
      type: 'GET',
      url: '/social/friends/' + pieceStatus.year + '/' + pieceStatus.month + '/' + pieceStatus.day,
      success: function(friendsData) {
        console.log(friendsData);
        var $friendsFeeling = $('#friends-feeling');
        var feelingRelative = {
          '1': '.feeling-good',
          '2': '.feeling-bad',
          '3': '.feeling-normal'
        };
        var providerRealtive = {
          twitter: {
            url: 'http://twiticon.herokuapp.com/$1/mini',
            key: 'raw_name'
          },
          facebook: {
            url: 'https://graph.facebook.com/$1/picture',
            key: 'id'
          }
        };
        for (var key in friendsData.pieces) {
          $container = $friendsFeeling.find(feelingRelative[key]);
          $.each(friendsData.pieces[key], function(i, piece) {
            var user = piece.user_id;
            var provider = providerRealtive[user.provider];
            $container.append('<img class="user-icon" src="' + provider.url.replace('$1', user[provider.key]) + '">');
          });
        }
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
