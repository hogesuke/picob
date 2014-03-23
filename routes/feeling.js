"use strict";

var FeelingGroup = require('../models/feeling').FeelingGroup;
var Feeling = require('../models/feeling').Feeling;

/**
 * テストデータ作成用。
 */
exports.testDataInsert = function(req, res) {
  FeelingGroup.create({
    name: 'Good',
    type: 'good'
  }, function(err, fGroup1) {
    Feeling.create({text: '楽しい'}, function(err, feeling) {
      feeling.group = fGroup1;
      feeling.save(function(err) {
        Feeling.create({text: '幸せ'}, function(err, feeling) {
          feeling.group = fGroup1;
          feeling.save(function(err) {
            FeelingGroup.create({
              name: 'Bad'
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
                    FeelingGroup.create({
                      name: 'Normal'
                    }, function(err, fGroup3) {
                      if (err) {
                        console.log('fGroup3でエラーですよ：' + err);
                      }
                      Feeling.create({text: '平常'}, function(err, feeling) {
                        feeling.group = fGroup3;
                        feeling.save(function(err) {
                          Feeling.create({text: '退屈'}, function(err, feeling) {
                            feeling.group = fGroup3;
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
        });
      });
    });
  });

  res.send('テストデータを登録しました。');
}
