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
      res.render('unknown.ejs');
      return;
    }
    
    next();
  });
};

exports.getFriendsFeeling = function(req, res) {
  var user = req.session.passport.user;
  if (!user) {
    res.send({'error': 'An error has occurred'});
    return;
  }

  passport._strategies.twitter._oauth.getProtectedResource(
      'https://api.twitter.com/1.1/friends/ids.json',
      'GET',
      user.token,
      user.tokenSecret,
      function (err, data, response) {
        if(err) {
          console.log('error: twitter api.');
          res.send({'error': 'An error has occurred'});
          return;
        }

        var friendIds = JSON.parse(data).ids;
        User.find({id: {$in: friendIds}}, function(err, friends) {
          if (err) {
            console.log('error: twitter api.');
            res.send({'error': 'An error has occurred'});
            return;
          }
          Piece.find({user_seq: {$in: createArray(friends, 'seq')}}, 'user_id feeling feeling_text')
            .populate({path: 'user_id', select: 'id name'})
            .populate({path: 'feeling_text', select: 'text'}).exec(function(err, pieces) {
              if (err) {
                console.log('error: twitter api.');
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
      });
};

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
