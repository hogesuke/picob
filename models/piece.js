/**
 * Piece model.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PieceSchema = new Schema({
    year: String,
    month: String,
    day: String,
    feeling: String,
    create_date: Date,
});

PieceSchema.pre('save', function(next) {
  this.create_date = new Date();
  next();
});

module.exports = mongoose.model('Piece', PieceSchema);
