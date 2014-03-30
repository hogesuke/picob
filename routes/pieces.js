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
      isVisible: existNext(requestYear, requestMonth),
      year: nextDate.getFullYear(),
      month: nextDate.getMonth() + 1 
    },
    prevDate: {
      isVisible: existPrev(requestYear, requestMonth),
      year: prevDate.getFullYear(),
      month: prevDate.getMonth() + 1 
    }
  });
};

/**
 * 次月の表示が可能か判定する。
 */
function existNext(requestYear, requestMonth) {
  var current = new Date();
  var currentYear = current.getFullYear();
  var currentMonth = current.getMonth() + 1;

  if (currentYear < requestYear) {
    return false;
  }
  if (currentYear == requestYear && currentMonth <= requestMonth) {
    return false;
  }
  return true;
}

/**
 * 前月の表示が可能か判定する。
 */
function existPrev(requestYear, requestMonth) {
  var current = new Date();
  var currentYear = current.getFullYear();
  var currentMonth = current.getMonth() + 1;

  if (requestYear < 2014) {
    return false;
  }
  if (currentYear == 2014 && requestMonth == 1) {
    return false;
  }
  return true;
}

/**
 * 次日の表示が可能か判定する。
 */
function existNextDate(requestYear, requestMonth, requestDate) {
  var current = new Date();
  var request = new Date(requestYear, requestMonth - 1, requestDate, 23, 59, 59, 999);

  if (current <= request) {
    return false;
  }
  return true;
}

/**
 * 前日の表示が可能か判定する。
 */
function existPrevDate(requestYear, requestMonth, requestDate) {
  if (requestYear < 2014) {
    return false;
  }
  if (requestYear == 2014 && requestMonth == 1 && requestDate == 1) {
    return false;
  }
  return true;
}

/**
 * リクエストされた年月が有効な年月の範囲内であるか確認する。
 * 有効範囲外である場合はエラー画面に遷移させる。
 */
exports.checkValidYm = function(req, res, next) {
  if (!isValidYm(req.params[1], req.params[2])) {
    res.redirect('/error');
    return;
  }
  next();
}

/**
 * リクエストされた年月日が有効な年月日の範囲内であるか確認する。
 * 有効範囲外である場合はエラー画面に遷移させる。
 */
exports.checkValidYmd = function(req, res, next) {
  if (!isValidYmd(req.params[1], req.params[2], req.params[3])) {
    res.redirect('/error');
    return;
  }
  next();
}

/**
 * リクエストされた年月日が有効な年月日の範囲内であるか確認する。
 * 有効範囲外である場合はエラー画面に遷移させる。
 */
exports.checkValidYmdForAjax = function(req, res, next) {
  if (!isValidYmd(req.params[1], req.params[2], req.params[3])) {
    res.send(422, {path: '/error'});
    return;
  }
  next();
}

/**
 * リクエストされた年月が有効な年月の範囲内であるか精査する。
 *
 * @param requestYear 年
 * @param requestMonth 月
 * @return true:範囲内 false:範囲外
 */
function isValidYm(requestYear, requestMonth) {
  var current = new Date();
  var currentYear = current.getFullYear();
  var currentMonth = current.getMonth() + 1;

  if (requestYear < 2014) {
    return false;
  }
  if (currentYear < requestYear) {
    return false;
  }
  if (currentYear == requestYear && currentMonth < requestMonth) {
    return false;
  }
  return true;
}

/**
 * リクエストされた年月日が有効な範囲に収まっているか精査する。
 *
 * @param requestYear 年
 * @param requestMonth 月
 * @param requestDate 日
 * @return true:範囲内 false:範囲外
 */
function isValidYmd(requestYear, requestMonth, requestDate) {
  var current = new Date();
  var currentYear = current.getFullYear();
  var currentMonth = current.getMonth() + 1;
  var currentDate = current.getDate();

  if (requestYear < 2014) {
    return false;
  }
  if (currentYear < requestYear) {
    return false;
  }
  if (currentYear == requestYear && currentMonth < requestMonth) {
    return false;
  }
  if (currentYear == requestYear && currentMonth == requestMonth && currentDate < requestDate) {
    return false;
  }
  // 月の最終日を超えていないか確認する
  if (new Date(requestYear, requestMonth, 0).getDate() < requestDate) {
    return false;
  }
  return true;
}

/**
 * 今日のpieceを個別表示する。
 */
exports.today = function(req, res) {

  var date = new Date();
  var requestYear = date.getFullYear();
  var requestMonth = date.getMonth() + 1;
  var requestDate = date.getDate();

  doEntryView(req, res, requestYear, requestMonth, requestDate);
};

/**
 * 指定した年月日のpieceを個別表示する。
 */
exports.oneDay = function(req, res) {

  var requestYear = req.params[1];
  var requestMonth = req.params[2].replace(/^0?([0-9]+)/, '$1');
  var requestDate = req.params[3].replace(/^0?([0-9]+)/, '$1');

  doEntryView(req, res, requestYear, requestMonth, requestDate);
};

/**
 * EntryViewの表示処理。
 */
function doEntryView(req, res, requestYear, requestMonth, requestDate) {

  var defaultPiece = {
    feeling: "none"
  }
  var targetUserSeq = req.params[0];

  // 取得対象のユーザーがログインユーザー（自分）であるか確認する。
  var isMe = false;
  var loginUser = req.session.passport.user;
  if (loginUser.seq == targetUserSeq) {
    isMe = true;
  }

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

      Piece.findOne({user_seq: targetUserSeq, year: requestYear, month: requestMonth, day: requestDate}, function(err, piece) {
          if (err) {
            console.log('error: An error has occurred');
            res.render('error.ejs');
            return;
          }
          console.log('Success: Getting piece');
          console.log('piece: ' + piece);

          var nextDate = computeDate(requestYear, requestMonth, requestDate, 1);
          var prevDate = computeDate(requestYear, requestMonth, requestDate, -1);

          res.render('entry.ejs', {
            userSeq: targetUserSeq,
            thisDate: {
              year: requestYear,
              month: requestMonth,
              day: requestDate
            },
            nextDate: {
              isVisible: existNextDate(requestYear, requestMonth, requestDate),
              year: nextDate.getFullYear(),
              month: nextDate.getMonth() + 1,
              day: nextDate.getDate()
            },
            prevDate: {
              isVisible: existPrevDate(requestYear, requestMonth, requestDate),
              year: prevDate.getFullYear(),
              month: prevDate.getMonth() + 1,
              day: prevDate.getDate()
            },
            feelings: feelingsEveryGroup,
            piece: piece ? piece : defaultPiece,
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
 * @param requestDate 日
 * @param addDays 加算日数（マイナスの指定も可能）
 */
function computeDate(requestYear, requestMonth, requestDate, addDays) {
  var dt = new Date(requestYear, requestMonth - 1, requestDate);
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
  var targetUserSeq = req.params[0];
  var requestYear = req.params[1];
  var requestMonth = req.params[2].replace(/^0?([0-9]+)/, '$1');
  var loginUser = req.session.passport.user;

  Piece.find({user_seq: targetUserSeq, year: requestYear, month: requestMonth}, function(err, pieces) {
      if (err) {
        console.log('error: An error has occurred');
        res.send({'error': 'An error has occurred'});
        return;
      }

      res.send(
        {
          year: requestYear,
          month: requestMonth,
          pieces: createPieceArray(requestYear, requestMonth, pieces)
        });
    });
}

/**
 * pieceの精査を行う。
 *
 * @param req.body.year 年
 * @param req.body.month 月
 * @param req.body.day 日
 * @param req.body.feeling 気分
 * @param req.body.feeling-text 気分テキスト
 */
exports.validatePiece = function(req, res, next) {
  var requestYear = req.params[1];
  var requestMonth = req.params[2].replace(/^0?([0-9]+)/, '$1');
  var requestDate = req.params[3].replace(/^0?([0-9]+)/, '$1');

  if (!isValidYmd) {
    res.send(422, {path: '/error'});
    return;
  }

  next();
}


/**
 * pieceの更新・登録を行う(Ajax)。
 *
 * @param req.body.year 年
 * @param req.body.month 月
 * @param req.body.day 日
 * @param req.body.feeling 気分
 * @param req.body.feeling-text 気分テキスト
 * @return upsertの結果メッセージ
 */
exports.upsertPiece = function(req, res) {
  var requestYear = req.params[1];
  var requestMonth = req.params[2].replace(/^0?([0-9]+)/, '$1');
  var requestDate = req.params[3].replace(/^0?([0-9]+)/, '$1');
  var loginUser = req.session.passport.user;

  // TODO req.bodyの値がすべて空でないか精査する処理を実装すること
  var updateValues = {};
  if (req.body.feeling) {
    updateValues.feeling = req.body.feeling;
  }
  if (req.body.feeling_text) {
    updateValues.feeling_text = req.body.feeling_text;
  }

  Piece.update(
      {'user_id': loginUser._id, 'user_seq': loginUser.seq, 'year': requestYear, 'month': requestMonth, 'day': requestDate},
      updateValues,
      {'upsert': true, multi: false},
      function(err) {
        if (err) {
          console.log('Error: Upsert piece:' + err);
          res.send({'error': 'An error has occurred - ' + err});
          return;
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
  
  var lastDate = new Date(requestYear, requestMonth, 0).getDate();
  var pieceArray = new Array(lastDate);
  for (var i=0; i < lastDate; i++) {
    pieceArray[i] = {year: requestYear, month: requestMonth, day: i + 1, feeling: 'none'};
  }

  searchResult.forEach(function(piece, index) {
    pieceArray[piece.day - 1] = piece;
  });

  var day = new Date(Number(requestYear), Number(requestMonth) - 1, 1).getDay();
  // 月の初めの曜日までを埋めるための配列を作成
  var emptyArray = new Array(day);

  return emptyArray.concat(pieceArray);
}
