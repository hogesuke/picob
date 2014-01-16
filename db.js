/*
 * MongoDB Connector Js.
 */
var mongoose = require('mongoose');
var Piece;

exports.connect = function() {
  mongoose.connect('mongodb://localhost/picob');

  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    console.log("Connected to 'picob' database");
    Piece = mongoose.model('Piece');
  });
}
