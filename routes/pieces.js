"use strict";

var Piece = require('../models/piece');
var FeelingGroup = require('../models/feeling').FeelingGroup;
var Feeling = require('../models/feeling').Feeling;
var User = require('../models/user');

/**
 * pieceをカレンダー表示する。
 */
exports.calendar = function(req, res) {

  var userSeq = req.params[0];
  var requestYear = req.params[1];
  var requestMonth = req.params[2];
  var nextDate = computeMonth(requestYear, requestMonth, 1);
  var prevDate = computeMonth(requestYear, requestMonth, -1);

  // TODO 現在年月以下であることを精査する処理を追加すること。

  res.render('index.ejs', {
    userSeq: userSeq,
    thisDate: {
      year: requestYear,
      month: requestMonth
    },
    nextDate: {
      year: nextDate.getFullYear(),
      month: nextDate.getMonth() + 1 
    },
    prevDate: {
      year: prevDate.getFullYear(),
      month: prevDate.getMonth() + 1 
    }
  });
};

/**
 * 今日のpieceを個別表示する。
 */
exports.today = function(req, res) {

  var date = new Date();
  var requestYear = date.getFullYear();
  var requestMonth = date.getMonth() + 1;
  var requestDay = date.getDate();

  doEntryView(req, res, requestYear, requestMonth, requestDay);
};

/**
 * 指定した年月日のpieceを個別表示する。
 */
exports.oneDay = function(req, res) {

  var requestYear = req.params[1];
  var requestMonth = req.params[2].replace(/^0?([0-9]+)/, '$1');
  var requestDay = req.params[3].replace(/^0?([0-9]+)/, '$1');

  doEntryView(req, res, requestYear, requestMonth, requestDay);
};

/**
 * EntryViewの表示処理。
 */
function doEntryView(req, res, requestYear, requestMonth, requestDay) {

  var targetUserSeq = req.params[0];

  // 取得対象のユーザーがログインユーザー（自分）であるか確認する。
  var isMe = false;
  var loginUser = req.session.passport.user;
  console.log('loginUser:  ' + loginUser);
  if (loginUser.seq === targetUserSeq) {
    isMe = true;
  }

  // TODO 現在年月以下であることを精査する処理を追加すること。

  FeelingGroup.find({}).sort({group: 'asc'}).exec(function(err, groups) {
    if (err) {
      res.send({'error': 'An error has occurred'});
      return;
    }

    Feeling.find({}).populate('group').sort({group: 'asc'}).exec(function(err, feelings) {
      if (err) {
        res.send({'error': 'An error has occurred'});
        return;
      }
      console.log('Success: Getting feeling-text list');

      // グループIDごとの配列となるように編集
      var feelingsEveryGroup = {};
      for (var i in groups) {
        feelingsEveryGroup[groups[i].name] = filterByFeelingGroup(feelings, groups[i]._id.toString());
      }

      Piece.findOne({user_seq: targetUserSeq, year: requestYear, month: requestMonth, day: requestDay})
        .populate('feeling_text').exec(function(err, result) {
          if (err) {
            console.log('error: An error has occurred');
            res.render('500.ejs');
            return;
          }
          console.log('Success: Getting piece');
          console.log('piece: ' + result);

          var nextDate = computeDate(requestYear, requestMonth, requestDay, 1);
          var prevDate = computeDate(requestYear, requestMonth, requestDay, -1);

          res.render('entry.ejs', {
            userSeq: targetUserSeq,
            thisDate: {
              year: requestYear,
              month: requestMonth,
              day: requestDay
            },
            nextDate: {
              year: nextDate.getFullYear(),
              month: nextDate.getMonth() + 1,
              day: nextDate.getDate()
            },
            prevDate: {
              year: prevDate.getFullYear(),
              month: prevDate.getMonth() + 1,
              day: prevDate.getDate()
            },
            feelings: feelingsEveryGroup,
            piece: result,
            isMe: isMe
          });
        });
    });
  });
}

/**
 * 年月日のn日後,n日前を求める。
 *
 * @param requestYear 年
 * @param requestMonth 月
 * @param requestDay 日
 * @param addDays 加算日数（マイナスの指定も可能）
 */
function computeDate(requestYear, requestMonth, requestDay, addDays) {
  var dt = new Date(requestYear, requestMonth - 1, requestDay);
  var baseSec = dt.getTime();
  var addSec = addDays * (24 * 60 * 60 * 1000); // 加算日数 * 1日のミリ秒
  dt.setTime(baseSec + addSec);
  return dt;
}

/**
 * 年月のn月後,n月前を求める。
 *
 * @param requestYear 年
 * @param requestMonth 月
 * @param addMonths 加算月数（マイナスの指定も可能）
 */
function computeMonth(requestYear, requestMonth, addMonths) {
  var dt = new Date(requestYear, requestMonth - 1, 1);
  dt.setMonth(dt.getMonth() + addMonths);
  return dt;
}

/**
 * feelings配列からgroupIdが合致する要素のみを抽出し、
 * 新たな配列を生成・返却する。
 *
 * @param groupId 抽出対象のグループID
 * @return 抽出した要素の配列
 */
function filterByFeelingGroup(feelings, groupId) {
  var newArray = [];
  for (var i in feelings) {
    if (groupId == feelings[i].group._id.toString()) {
      newArray.push(feelings[i]);
    }
  }
  return newArray;
}

/**
 * pieceの取得を行う(Ajax)。
 *
 * @param req.params[0] 取得対象の年
 * @param req.params[1] 取得対象の月
 * @return pieceの検索結果
 */
exports.findCalendarData = function(req, res) {
  console.log('Getting piecelist');

  var targetUserSeq = req.params[0];
  var requestYear = req.params[1];
  var requestMonth = req.params[2].replace(/^0?([0-9]+)/, '$1');
  var loginUser = req.session.passport.user;
  var isMe = false;

  console.log('loginUser:  ' + loginUser);
  if (loginUser.seq === targetUserSeq) {
    isMe = true;
  }

  Piece.find({user_seq: targetUserSeq, year: requestYear, month: requestMonth})
    .populate('feeling_text').exec(function(err, results) {
      if (err) {
        console.log('error: An error has occurred');
        res.send({'error': 'An error has occurred'});
        return;
      }
      console.log('Success: Getting piecelist');
      console.log('results: ' + results.length);

      res.send(
        {
          year: requestYear,
          month: requestMonth,
          pieces: createPieceArray(requestYear, requestMonth, results),
          isMe: isMe
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
exports.upsertPiece = function(req, res) {
  var requestYear = req.params[1];
  var requestMonth = req.params[2].replace(/^0?([0-9]+)/, '$1');
  var requestDay = req.params[3].replace(/^0?([0-9]+)/, '$1');
  var loginUser = req.session.passport.user;

  Piece.update(
      {'user_seq': loginUser.seq, 'year': requestYear, 'month': requestMonth, 'day': requestDay},
      {'feeling': req.body.feeling, 'feeling_text': req.body.feeling_text_id},
      {'upsert': true, multi: false},
      function(err) {
        if (err) {
          res.send({'error': 'An error has occurred - ' + err});
        }
        console.log('Success: Upsert piece');
        res.send({'msg': 'Success: upsert feeling'});
      });
}

/**
 * pieceの検索結果配列をCalendarViewにbindできる状態に編集し返却する。
 * 
 * @param requestYear 取得対象の年
 * @param requestMonth 取得対象の月
 * @param searchResult peaceの検索結果配列
 * @return viewにbindできる状態のpeace配列
 */
function createPieceArray(requestYear, requestMonth, searchResult) {

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
