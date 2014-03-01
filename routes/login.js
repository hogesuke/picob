"use strict";

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var LoginConfigration = require('../config/login-configration');
var User = require('../models/user');
var Counter = require('../models/counter');

/**
 * Facebook OAuth.
 */
passport.use(new FacebookStrategy({
  clientID: LoginConfigration.Facebook.clientID,
  clientSecret: LoginConfigration.Facebook.clientSecret,
  callbackURL: LoginConfigration.Facebook.callbackURL
}, login));

/**
 * Twitter OAuth.
 */
passport.use(new TwitterStrategy({
  consumerKey: LoginConfigration.Twitter.consumerKey,
  consumerSecret: LoginConfigration.Twitter.consumerSecret,
  callbackURL: LoginConfigration.Twitter.callbackURL
}, login));

/**
 * OAuth login.
 */
function login(accessToken, refreshToken, profile, done) {
  User.findOne({id: profile.id, provider: profile.provider}, function(err, user) {
    if (err) {
      return done(err);
    }
    if (user) {
      done(null, user);
    } else {
      Counter.getNewSeq('UserSeq', function(err, counter) {
        if (err) {
          console.log('error: An error has occurred');
          return done(err);
        }
        var newUser = new User();
        newUser.seq = counter.seq;
        newUser.id = profile.id;
        newUser.name = editUserName(profile);
        newUser.provider = profile.provider;
        newUser.save(function(err) {
          if (err) {
            console.log('error: An error has occurred');
            return done(err);
          }
        });

        done(null, newUser);
      });
    }
  });
}

/**
 * Providerごとに編集したユーザー名を取得する。
 */
function editUserName(profile) {
  if (profile.provider === 'facebook') {
    return profile.name.givenName +
      (typeof profile.name.middleName == 'undefined' ? '' : profile.name.middleName) +
      profile.name.familyName;
  }
  if (profile.provider === 'twitter') {
    return profile.displayName;
  }
}

passport.serializeUser(function(user, done){
  done(null, user);
});
 
passport.deserializeUser(function(user, done){
  User.findOne({id: user.id, provider: user.provider}, function(err, user) {
    done(err, user);
  });
});

/**
 * ログイン画面の表示。
 */
exports.index = function(req, res) {
  res.render('login.ejs', {});
};

/**
 * ログインチェック。
 * 未ログインの場合はログイン画面にリダイレクトする。
 */
exports.checkLogin = function(req, res, next) {
  if (req.session.passport.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

/**
 * ログアウトする。
 */
exports.logout = function(req, res) {
    req.logout();
    res.redirect('/login');
};
