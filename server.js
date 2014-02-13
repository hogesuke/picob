"use strict";

var express = require('express')
var mongoose = require('mongoose');
var dbConnector = require('./db');
var pieces = require('./routes/pieces');
var feeling = require('./routes/feeling');
var app = express();

dbConnector.connect();

app.engine('ejs', require('ejs').renderFile);
app.configure(function () {
  app.use(express.logger('dev')); /* 'default', 'short', 'tiny', 'dev' */
  //app.use('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.get('/', pieces.index);
app.get(/^\/(2[0-9]{3})\/(1[0-2]|0?[1-9])$/, pieces.findAll);
app.post('/feeling', pieces.upsertFeeling);
app.get('/testDataInsert', feeling.testDataInsert);
app.get('/feeling', feeling.findAll);

app.listen(3000);
console.log('Listening on port 3000...');
