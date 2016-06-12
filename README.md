picob
=======
毎日の気分を記録するWebサービス  
http://picob.net

#### スクリーンショット
![screenshot](https://raw.github.com/wiki/hogesuke/picob/img/picob_daily.jpg)

![screenshot](https://raw.github.com/wiki/hogesuke/picob/img/picob_cal2.jpg)

#### 自分用メモ

##### 起動
```
nvm use 4 # NOTE 0.11.xだとOAuthでエラーとなるので注意
cd /var/www/html/picob
forever start server.js NODE_ENV=production
```

##### 停止
```
forever list
forever stop <listで確認したforeverの番号>
```