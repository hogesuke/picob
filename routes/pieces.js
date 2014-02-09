"use strict";

var Piece = require('../models/piece');

/**
 * pieceをカレンダー表示する。
 */
exports.index = function(req, res) {
  res.render('index.ejs', {title: 'picob'});
}

/**
 * pieceの取得を行う(Ajax)。
 *
 * @param req.params[0] 取得対象の年
 * @param req.params[1] 取得対象の月
 * @return pieceの検索結果
 */
exports.findAll = function(req, res) {
  console.log('Getting piecelist');

  var requestYear = req.params[0];
  var requestMonth = req.params[1];

  Piece.find({year: requestYear, month: requestMonth}, function(err, results) {
    if (err) {
      res.send({'error': 'An error has occurred'});
      return;
    }
    console.log('Success: Getting piecelist');

    res.send(
      {
        year: requestYear,
        month: requestMonth,
        pieces: createPieceArray(results),
        day: day
      });
  });
}

/**
 * pieceの更新・登録を行う(Ajax)。
 *
 * @param req.body.year 年
 * @param req.body.month 月
 * @param req.body.day 日
 * @param req.body.feeling feeling
 * @return upsertの結果メッセージ
 */
exports.upsertFeeling = function(req, res) {
  console.log('update feeling');
  console.log(req.body);

  Piece.update(
      {'year': req.body.year, 'month': req.body.month, 'day': req.body.day},
      {'feeling': req.body.feeling},
      {'upsert': true, multi: false},
      function(err) {
        if (err) {
          res.send({'error': 'An error has occurred - ' + err});
        }
      });
  res.send({'msg': 'Success: upsert feeling'});
}

/**
 * pieceの検索結果配列をViewにbindできる状態に編集し返却する。
 *
 * @param searchResult peaceの検索結果配列
 * @return viewにbindできる状態のpeace配列
 */
function createPieceArray(searchResult) {

  var pieceArray = new Array(31);
  for (var i=0; i < 31; i++) {
    pieceArray[i] = {year: requestYear, month: requestMonth, day: i + 1, feeling: null};
  }

  searchResult.forEach(function(piece, index) {
    pieceArray[piece.day - 1] = piece;
  });

  var day = new Date(Number(requestYear), Number(requestMonth) - 1, 1).getDay();
  // 月の初めの曜日までを埋めるための配列を作成
  var emptyArray = new Array(day);

  return emptyArray.concat(pieceArray);
}
