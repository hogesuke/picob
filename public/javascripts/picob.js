$(function() {

  var locationStatus = {
    userSeq: undefined,
    year: undefined,
    month: undefined,
    init: function() {
      var pathname = window.location.pathname;
      if (pathname.match(/^\/([0-9]{1,9})\/calendar\/([0-9]{4})\/([0-9]{1,2})\/?$/)) {
        this.userSeq = RegExp.$1;
        this.year = RegExp.$2;
        this.month = RegExp.$3;
        return;
      }
      throw 'invalid url';
    }
  };

  locationStatus.init();

  var PieceViewModel = function(data) {
    ko.mapping.fromJS(data, {}, this);
    this.date = ko.computed(function() {
      if (data === null) {
        return '';
      }
      return this.day();
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
      return this.isDummy() ? 'dummy-piece' : (this.isDummy() ? 'empty-piece link ' : 'piece link ') + data.feeling;
    }, this);
    this.getHref = ko.computed(function() {
      return this.isDummy() ? '' : '/' + locationStatus.userSeq + '/entry/' + locationStatus.year + '/' + locationStatus.month + '/' + this.day();
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

  $(document).on('click', '.link', function() {
    var href = $(this).attr('href');
    if (href) {
      window.location = href;
    }
  });

  $(document).on('click', '.login-user-icon', function() {
    var $userMenu = $('.user-menu');
    if ($userMenu.is('.inactive')) {
      $userMenu.show(0, function() {
        $userMenu.addClass('active').removeClass('inactive');
      });
    } else {
      $userMenu.hide(0, function() {
        $userMenu.addClass('inactive').removeClass('active');
      });
    }
  });

  function selectPiece(doSuccess) {
    var userSeq = window.location.pathname;
    var $currentYM = $('#current-ym');
    $.ajax({
      type: 'GET',
      url: '/' + getUserSeq() + '/' + $currentYM.attr('year') + '/' + $currentYM.attr('month'),
      success: function(res) {
        doSuccess(res.pieces);
      },
      error: function() {
      }
    });
  }

  function getUserSeq() {
    var pathname = window.location.pathname;
    if (pathname.match(/^\/([0-9]{1,9})\/calendar\/[0-9]{4}\/[0-9]{1,2}\/?$/)) {
      return RegExp.$1
    }
    throw 'invalid url';
  }
});

/**
 * Facebook OAuthでログインした場合にurlに付与されてしまうハッシュを削除。
 */
if (window.location.hash == "#_=_") window.location.hash = "";
