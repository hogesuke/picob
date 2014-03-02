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

  $(document).on('click', '.piece, .empty-piece', function() {
  });

  $('#prev-month').on('click', function() {
  });

  $('#next-month').on('click', function() {
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
