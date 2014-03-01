"use strict";
var User = require('../models/user');

/**
 * 閲覧対象のユーザーが存在するか確認する。
 */
exports.validateUser = function(req, res, next) {
  var targetUserSeq = req.params[0];
  User.count({seq: targetUserSeq}, function(err, count) {
    if (err) {
      console.log('error: An error has occurred');
      return;
    }
    if (!count) {
      console.log('error: An unknown user');
      res.render('unknown.ejs');
      return;
    }
    
    next();
  });
};
