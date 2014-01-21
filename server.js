"use strict";

var express = require('express')
var mongoose = require('mongoose');
var dbConnector = require('./db');
var pieceModel = require('./models/piece');
var pieces = require('./routes/pieces');
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

app.get(/^\/(2[0-9]{3})\/(1[0-2]|[1-9])$/, pieces.findAll);
app.post('/feeling', pieces.saveFeeling);

app.listen(3000);
console.log('Listening on port 3000...');
console.log(app.routes);
