"use strict";

var FeelingGroup = require('../models/feeling').FeelingGroup;
var Feeling = require('../models/feeling').Feeling;

/**
 * feelingをすべて取得。
 */
exports.findAll = function(req, res) {
  Feeling.find({}).populate('FeelingGroup').exec(function(err, results) {
    if (err) {
      res.send({'error': 'An error has occurred'});
      return;
    }


    console.log('Success: Getting feelinglist');
    console.log(results);

    res.send(results);
  });
}

/**
 * テストデータ作成用。
 */
exports.testDataInsert = function(req, res) {
  FeelingGroup.create({
    name: 'ポジティブ'
  }, function(err, fGroup1) {
    Feeling.create({text: '楽しい'}, function(err, feeling) {
      feeling.group = fGroup1;
      feeling.save(function(err) {
        Feeling.create({text: '幸せ'}, function(err, feeling) {
          feeling.group = fGroup1;
          feeling.save(function(err) {
            FeelingGroup.create({
              name: 'ネガティブ'
            }, function(err, fGroup2) {
              if (err) {
                console.log('fGroup2でエラーですよ：' + err);
              }
              Feeling.create({text: '悲しい'}, function(err, feeling) {
                feeling.group = fGroup2;
                feeling.save(function(err) {
                  Feeling.create({text: '辛い'}, function(err, feeling) {
                    feeling.group = fGroup2;
                    feeling.save();
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  res.send('テストデータを登録しました。');
}
