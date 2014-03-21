"use strict";

/**
 * errorページを表示する。
 */
exports.index = function(req, res) {
  res.status(500);
  res.render('error.ejs');
};

exports.unauthorized = function(req, res) {
  res.status(403);
  res.render('unauthorized.ejs');
};

exports.unknown = function(req, res) {
  res.status(403);
  res.render('unknown.ejs');
};
