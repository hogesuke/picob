/**
 * Counter model.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 
var counterSchema = new Schema({
    name: {type: String},
    seq: {type: Number}
});
 
counterSchema.statics.getNewSeq = function (name, callback) {
  return this.collection.findAndModify(
    {name: name},     // query
    [],               // sort
    {$inc: {seq: 1}}, // 取得のタイミングでseqをインクリメント
    {new: true, upsert: true},
    callback
  );
};
 
module.exports = mongoose.model('Counter', counterSchema);
