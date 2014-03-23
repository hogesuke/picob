/**
 * Feeling model.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FeelingGroupSchema = new Schema({
  name: {type: String},
  type: {type: String}
});

var FeelingSchema = new Schema({
  group: {type: mongoose.Schema.Types.ObjectId, ref: 'FeelingGroup'},
  text: {type: String}
});

module.exports.FeelingGroup = mongoose.model('FeelingGroup', FeelingGroupSchema);
module.exports.Feeling = mongoose.model('Feeling', FeelingSchema);
