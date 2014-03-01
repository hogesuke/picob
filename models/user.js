/**
 * User model.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  seq: {type: Number},
  id: {type: String},
  name: {type: String},
  provider: {type: String},
  create_date: {type: Date}
});

UserSchema.pre('save', function(next) {
  this.create_date = new Date();
  next();
});

module.exports = mongoose.model('User', UserSchema);
