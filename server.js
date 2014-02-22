"use strict";

var express = require('express')
var mongoose = require('mongoose');
var dbConnector = require('./db');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var pieces = require('./routes/pieces');
var feeling = require('./routes/feeling');
var login = require('./routes/login');
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
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.get('/', login.checkLogin, pieces.index);
app.get('/login', login.index);
app.get('/logout', login.logout);
app.post('/login/facebook', passport.authenticate('facebook'));
app.get('/login/facebook/callback',
  passport.authenticate('facebook',{failureRedirect: '/fail'}),
  function(req, res) {
    res.redirect('/');
  }
);
app.get(/^\/(2[0-9]{3})\/(1[0-2]|0?[1-9])$/, pieces.findAll);
app.post('/feeling', pieces.upsertFeeling);
app.get('/testDataInsert', feeling.testDataInsert);

app.listen(3000);
console.log('Listening on port 3000...');
