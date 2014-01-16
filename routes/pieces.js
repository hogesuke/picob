"use strict";

var Piece = require('../models/piece');

exports.findAll = function(req, res) {
  console.log('Getting piecelist');

  Piece.find({}, function(err, results) {
    if (err) {
      res.send({'error': 'An error has occurred'});
    } else {
      console.log('Success: Getting piecelist');
      res.render('index.ejs', {title: 'タイトル', pieces: results});
    }
  });
}

exports.saveFeeling = function(req, res) {
  console.log('Save feeling');

  Piece.create({'date': req.body.date, 'feeling': req.body.feeling}, function(err) {
    if (err) {
      res.send({'error': 'An error has occurred - ' + err});
    }
  });
}
