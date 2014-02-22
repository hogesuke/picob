"use strict";

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var LoginConfigration = require('../config/login-configration');
var User = require('../models/user');

passport.use(new FacebookStrategy({
    clientID: LoginConfigration.Facebook.clientID,
    clientSecret: LoginConfigration.Facebook.clientSecret,
    callbackURL: "http://localhost:3000/login/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({id: profile.id, provider: profile.provider}, function(err, user) {
      if (err) {
        return done(err);
      }
      if (user) {
        done(null, user);
      } else {
        var newUser = new User();
        newUser.id = profile.id;
        newUser.name = profile.name.givenName + profile.name.middleName + profile.name.familyName;
        newUser.provider = profile.provider;
        newUser.save(function(err) {
          if (err) {
            console.log('error: An error has occurred');
            return done(err);
          }
        });

        done(null, newUser);
      }
    });
  }
));

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
