"use strict";

var express = require('express')
var mongoose = require('mongoose');
var dbConnector = require('./db');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var login = require('./routes/login');
var user = require('./routes/user');
var pieces = require('./routes/pieces');
var feeling = require('./routes/feeling');
var app = express();

dbConnector.connect();

app.engine('ejs', require('ejs').renderFile);
app.configure(function () {
  app.use(express.logger('dev')); /* 'default', 'short', 'tiny', 'dev' */
  //app.use('view engine', 'ejs');
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({secret: 'testtesttest'}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.csrf());
  app.use(function (req, res, next) {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    res.locals.csrftoken = req.csrfToken();
    next();
  });
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));

//  app.use(function(err, req, res, next) {
//    console.log('なんかエラーみたいだね');
//    if (err.name === "Forbidden") {
//      res.status(403).render('error.ejs');
//    } else {
//      next(err);
//    }
//  });
});

/**
 * CSRF対策のtokenを生成する。
 */
function csrf(req, res, next) {
  console.log('create token');
  res.locals.token = req.session._csrf;
  next();
}

/**
 * loginのルーティング
 */
app.get('/login', login.index);
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
    login.checkLogin,
    user.validateUser,
    pieces.calendar);
app.get(/^\/([0-9]{1,9})\/(2[0-9]{3})\/(1[0-2]|0?[1-9])\/?$/, // /[userSeq]/[year]/[month]
    login.checkLogin,
    user.validateUser,
    pieces.findCalendarData);

/**
 * entryページのルーティング
 */
var entryUri = /^\/([0-9]{1,9})\/entry\/(2[0-9]{3})\/(1[0-2]|0?[1-9])\/(0?[1-9]|[1,2][0-9]|3[0,1])\/?$/; // /[userSeq]/entry/[year]/[month]/[day]
app.get(/^\/([0-9]{1,9})\/entry\/today$/, // /[userSeq]/entry/today
    login.checkLogin,
    user.validateUser,
    pieces.today);
app.get(entryUri,
    login.checkLogin,
    user.validateUser,
    pieces.oneDay);
app.post(entryUri,
    //csrf,
    login.checkLogin,
    user.validateUser, // TODO ユーザーの存在チェックじゃなくて対象ユーザーが自分かをチェックするようにする
    pieces.upsertPiece);

/**
 * ソーシャルな部品取得のためのルーティング
 */
app.get(/\/social\/friends\/(2[0-9]{3})\/(1[0-2]|0?[1-9])\/(0?[1-9]|[1,2][0-9]|3[0,1])\/?$/, // /social/friends/[year]/[month]/[day]
    login.checkLogin,
    user.getFriendsFeeling);

/**
 * デバッグ用のルーティング
 */
app.get('/testDataInsert', feeling.testDataInsert);

app.listen(3000);
console.log('Listening on port 3000...');
