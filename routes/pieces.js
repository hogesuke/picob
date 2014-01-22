"use strict";

var Piece = require('../models/piece');

exports.findAll = function(req, res) {
  console.log('Getting piecelist');

  var requestYear = req.params[0];
  var requestMonth = req.params[0];

  Piece.find({year: requestYear, month: requestMonth}, function(err, results) {
    if (err) {
      res.send({'error': 'An error has occurred'});
    } else {
      console.log('Success: Getting piecelist');

      var pieceArray = new Array(31);
      results.forEach(function(piece, index) {
        pieceArray[piece.day] = piece;
      });

      res.render('index.ejs',
        {
          title: 'タイトル',
          pieces: pieceArray,
          firstDayOfTheWeek: new Date(Number(requestYear), Number(requestMonth) - 1, 1).getDay()
        });
    }
  });
}

exports.saveFeeling = function(req, res) {
  console.log('Save feeling');

  Piece.create({'year': req.body.year, 'month': req.body.month, 'day': req.body.day, 'feeling': req.body.feeling}, function(err) {
    if (err) {
      res.send({'error': 'An error has occurred - ' + err});
    }
  });
}
