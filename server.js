"use strict";

var express = require('express')
var pieces = require('./routes/pieces');

var app = express();

app.engine('ejs', require('ejs').renderFile);

app.configure(function () {
  app.use(express.logger('dev')); /* 'default', 'short', 'tiny', 'dev' */
  //app.use('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.get ('/', pieces.findAll);

app.listen(3000);
console.log('Listening on port 3000...');
