# Saider

![Saider](public/image/saider.png)

A interactive dice bot

[Demo](http://saider.sinjis-view.mydns.jp)

## Saiderでできること

* ルーム機能
* ダイスロールの共有
* メモの共有
* マップの共有
  * 画像を表示するだけでコマ機能はありません
  
## これから実現したいこと

* コマ機能
* パスワード付きのルーム
* BGM再生
* 管理者用の機能

## ローカルで動かす方法

Node.jsをインストールする

Redisをインストールする

関係パッケージをインストールする

```
$ npm install
```

Redisを起動する

```
$ redis-server
```

サーバーを起動させる

```
$ node saider.js
```

ブラウザ以下のURLにアクセスする

```
localhost:31102
```

## License

MIT License

&copy; 2015-2016 SAKATA Sinji
