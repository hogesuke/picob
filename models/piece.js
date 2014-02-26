/**
 * Piece model.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PieceSchema = new Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    year: {type: String},
    month: {type: String},
    day: {type: String},
    feeling: {type: String},
    feeling_text: {type: mongoose.Schema.Types.ObjectId, ref: 'Feeling'},
    create_date: {type: Date},
});

PieceSchema.pre('save', function(next) {
  this.create_date = new Date();
  next();
});

module.exports = mongoose.model('Piece', PieceSchema);
