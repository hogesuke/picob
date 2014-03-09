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
var facebookStrategy = new FacebookStrategy({
  clientID: LoginConfigration.Facebook.clientID,
  clientSecret: LoginConfigration.Facebook.clientSecret,
  callbackURL: LoginConfigration.Facebook.callbackURL
}, login);
passport.use(facebookStrategy);

/**
 * Twitter OAuth.
 */
var twitterStrategy = new TwitterStrategy({
  consumerKey: LoginConfigration.Twitter.consumerKey,
  consumerSecret: LoginConfigration.Twitter.consumerSecret,
  callbackURL: LoginConfigration.Twitter.callbackURL
}, login);
passport.use(twitterStrategy);

/**
 * OAuth login.
 */
function login(token, tokenSecret, profile, done) {
  User.findOne({id: profile.id, provider: profile.provider}, function(err, user) {
    if (err) {
      console.log('error: An error has occurred');
      return done(err);
    }
    if (user) {
      console.dir(profile);
      user._doc.token = token;
      user._doc.tokenSecret = tokenSecret;
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
        newUser.raw_name = profile.username;
        newUser.name = profile.displayName;
        newUser.provider = profile.provider;
        newUser.save(function(err) {
          if (err) {
            console.log('error: An error has occurred');
            return done(err);
          }
          newUser._doc.token = token;
          newUser._doc.tokenSecret = tokenSecret;
          done(null, newUser);
        });
      });
    }
  });
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

/**
 * Strategys.
 */
exports.facebookStrategy = facebookStrategy;
exports.twitterStrategy = twitterStrategy;
