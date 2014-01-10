"use strict";

var mongoose = require('mongoose');

// Default Schemaを取得
var Schema = mongoose.Schema;

// Defaultのスキーマから新しいスキーマを定義
var PieceSchema = new Schema({
    date: String,
    feeling: String,
    create_date: Date,
});

// ドキュメント保存時にフックして処理したいこと
PieceSchema.pre('save', function(next) {
  this.create_date = new Date();
  next();
});

// モデル化。model('[登録名]', '定義したスキーマクラス')
mongoose.model('Piece', PieceSchema);

var Piece;

// mongodb://[hostname]/[dbname]
mongoose.connect('mongodb://localhost/picob');

// mongoDB接続時のエラーハンドリング
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected to 'picob' database");
  // 定義したときの登録名で呼び出し
  Piece = mongoose.model('Piece');
  populateDB();
});

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

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {

  var pieces = [
  {
    date: '20130101',
    feeling: "1",
  },
  {
    date: '20130102',
    feeling: "2",
  },
  {
    date: '20130103',
    feeling: "3",
  }
  ];

  Piece.remove(function(err) {
    if (err) {
      res.send({'error': 'An error has occurred - ' + err});
    }
  });

  Piece.create(pieces, function(err) {
    if (err) {
      res.send({'error': 'An error has occurred - ' + err});
    }
  });

};
