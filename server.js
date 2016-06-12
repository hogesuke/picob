"use strict";

var express = require('express');
var mongoose = require('mongoose');
var dbConnector = require('./db');
var partials = require('express-partials');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var login = require('./routes/login');
var user = require('./routes/user');
var pieces = require('./routes/pieces');
var error = require('./routes/error');
var app = express();

dbConnector.connect();

//app.engine('ejs', require('ejs').renderFile);
app.configure(function () {
  app.use(express.logger('dev')); /* 'default', 'short', 'tiny', 'dev' */
  app.use('view engine', 'ejs');
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({secret: 'testtesttest'}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.csrf());
  app.use(partials());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(function(req, res, next){
    res.status(404);
    res.render('404.ejs');
  });
});

/**
 * CSRF対策のtokenを生成する。
 */
function root(req, res, next) {
  var me = req.session.passport && req.session.passport.user;
  if (me) {
    res.redirect('/' + me.seq + '/entry/today');
  } else {
    res.redirect('/login');
  }
}

/**
 * CSRF対策のtokenを生成する。
 */
function csrf(req, res, next) {
  res.locals.csrftoken = req.csrfToken();
  next();
}

/**
 * ルートのルーティング
 */
app.get('/', csrf, root);

/**
 * loginのルーティング
 */
app.get('/login', csrf, login.index);
app.get('/logout', login.logout);
app.post('/login/facebook', passport.authenticate('facebook'));
app.post('/login/twitter', passport.authenticate('twitter'));
app.get('/login/facebook/callback',
  passport.authenticate('facebook',{failureRedirect: '/fail'}),
  function(req, res) {
    var loginUser = req.session.passport.user;
    res.redirect('/' + loginUser.seq + '/entry/today');
  }
);
app.get('/login/twitter/callback',
  passport.authenticate('twitter',{failureRedirect: '/fail'}),
  function(req, res) {
    var loginUser = req.session.passport.user;
    res.redirect('/' + loginUser.seq + '/entry/today');
  }
);

/**
 * calendarページのルーティング
 */
app.get(/^\/([0-9]{1,9})\/calendar\/(2[0-9]{3})\/(1[0-2]|0?[1-9])\/?$/, // /[userSeq]/calendar/[year]/[month]
    user.validateUser,
    pieces.checkValidYm,
    pieces.calendar);
app.get(/^\/([0-9]{1,9})\/(2[0-9]{3})\/(1[0-2]|0?[1-9])\/?$/, // /[userSeq]/[year]/[month]
    user.validateUser,
    pieces.findCalendarData);

/**
 * entryページのルーティング
 */
var entryUri = /^\/([0-9]{1,9})\/entry\/(2[0-9]{3})\/(1[0-2]|0?[1-9])\/(0?[1-9]|[1,2][0-9]|3[0,1])\/?$/; // /[userSeq]/entry/[year]/[month]/[day]
app.get(/^\/([0-9]{1,9})\/entry\/today$/, // /[userSeq]/entry/today
    csrf,
    user.validateUser,
    pieces.today);
app.get(entryUri,
    csrf,
    user.validateUser,
    pieces.checkValidYmd,
    pieces.oneDay);
app.post(entryUri,
    login.checkLogin,
    user.validateEntryTargetUser,
    pieces.validatePiece,
    pieces.checkValidYmdForAjax,
    pieces.upsertPiece);

/**
 * errorページのルーティング
 */
app.get('/error', error.index);
app.get('/unknown', error.unknown);
app.get('/unauthorized', error.unauthorized);

/**
 * 規約、プライバシーポリシーのルーティング
 */
app.get('/agreement', function(req, res) {res.render('agreement.ejs')});
app.get('/privacy_policy', function(req, res) {res.render('privacy_policy.ejs')});

app.listen(3000);
console.log('Listening on port 3000...');
