"use strict";

var Piece = require('../models/piece');

exports.index = function(req, res) {
  res.render('index.ejs', {title: 'picob'});
}

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

    var pieceArray = new Array(31);
    for (var i=0; i < 31; i++) {
      pieceArray[i] = {year: requestYear, month: requestMonth, day: i + 1, feeling: null};
    }

    results.forEach(function(piece, index) {
      pieceArray[piece.day - 1] = piece;
    });

    var firstDayOfTheWeek = new Date(Number(requestYear), Number(requestMonth) - 1, 1).getDay();
    // 月の初めの曜日までを埋めるための配列を作成
    var emptyArray = new Array(firstDayOfTheWeek);

    res.send(
      {
        year: requestYear,
        month: requestMonth,
        pieces: emptyArray.concat(pieceArray),
        firstDayOfTheWeek: firstDayOfTheWeek
      });
  });
}

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
