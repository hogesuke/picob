"use strict";
var passport = require('passport');
var User = require('../models/user');
var Piece = require('../models/piece');

/**
 * 閲覧対象のユーザーが存在するか確認する。
 */
exports.validateUser = function(req, res, next) {
  var targetUserSeq = req.params[0];

  User.count({seq: targetUserSeq}, function(err, count) {
    if (err) {
      console.log('error: An error has occurred');
      return;
    }
    if (!count) {
      console.log('error: An unknown user');
      res.redirect('/unknown');
      return;
    }
    next();
  });
};

/**
 * 投稿対象のユーザーがログインユーザー自身であるか確認する。
 */
exports.validateEntryTargetUser = function(req, res, next) {
  var me = req.session.passport && req.session.passport.user;
  var targetUserSeq = req.params[0];

  if (!me || me.seq != targetUserSeq) {
    res.send(403, {path: '/unauthorized'});
    return;
  }
  next();
};

/**
 * 友達のpiece投稿を取得する。
 */
exports.getFriendsFeeling = function(req, res) {
  var user = req.session.passport && req.session.passport.user;
  if (!user) {
    res.send({'error': 'An error has occurred'});
    return;
  }

  if (user.provider === 'twitter') {
    selectFriendsPieceForTwitter(req, res, user);
    return;
  }
  if (user.provider === 'facebook') {
    selectFriendsPieceForFacebook(req, res, user);
  }
};

/**
 * 友達のpiece投稿を取得する（Twitter)。
 */
function selectFriendsPieceForTwitter(req, res, user) {
  passport._strategies.twitter._oauth.getProtectedResource(
      'https://api.twitter.com/1.1/friends/ids.json',
      'GET',
      user.token,
      user.tokenSecret,
      function (err, data, response) {
        if(err) {
          console.log('error: twitter api.');
          console.dir(err);
          res.send({'error': 'An error has occurred'});
          return;
        }

        var friendIds = JSON.parse(data).ids;
        selectFriedsPiece(req, res, friendIds);
      });
}

/**
 * 友達のpiece投稿を取得する（Facebook)。
 */
function selectFriendsPieceForFacebook(req, res, user) {
  passport._strategies.facebook._oauth2.getProtectedResource(
      'https://graph.facebook.com/me/friends',
      user.token,
      function (err, data, response) {
        if(err) {
          console.log('error: facebook api.');
          res.send({'error': 'An error has occurred'});
          return;
        }
        console.dir(data);

        var friendIds = createArray(JSON.parse(data).data, 'id');
        selectFriedsPiece(req, res, friendIds);
      });
}

/**
 * 友達のpiece投稿を取得する（共通処理)。
 */
function selectFriedsPiece(req, res, friendIds) {
  var requestYear = req.params[0];
  var requestMonth = req.params[1];
  var requestDay = req.params[2];
  console.dir('req.params');
  console.dir(req.params);
  User.find({id: {$in: friendIds}}, function(err, friends) {
    if (err) {
      console.log('error: facebook api.');
      res.send({'error': 'An error has occurred'});
      return;
    }
    Piece.find({user_seq: {$in: createArray(friends, 'seq')},
      year: requestYear, month: requestMonth, day: requestDay}, 'user_id feeling feeling_text')
    .populate({path: 'user_id', select: 'id raw_name name provider'})
    .populate({path: 'feeling_text', select: 'text'}).exec(function(err, pieces) {
      if (err) {
        console.log('error: facebook api.');
        console.dir(err);
        res.send({'error': 'An error has occurred'});
        return;
      }
      res.send({
        ids: friendIds,
        pieces: groupPiece(pieces)
      });
    });
  });
}

/**
 * pieceをfeelingごとのグループに分ける。
 */
function groupPiece(pieces) {
  var groupedPiece = {};
  for (var i in pieces) {
    var piece = pieces[i];
    var feeling = piece.feeling;
    if (groupedPiece[feeling]) {
      groupedPiece[feeling].push(piece);
    } else {
      groupedPiece[feeling] = [piece];
    }
  }
  return groupedPiece;
}

/**
 * オブジェクト配列から特定のキーに紐づく値の配列を生成する。
 */
function createArray(objectArray, key) {
  var array = [];
  for (var i in objectArray) {
    var obj = objectArray[i];
    array.push(obj[key]);
  }
  return array;
}
