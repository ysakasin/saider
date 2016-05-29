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
$ npm run dev
```

ブラウザ以下のURLにアクセスする

```
localhost:31102
```

## 実環境で動かす

Node.js, Redisをインストールする

`config.json.example` をもとに `config.json` を編集する

Redisを起動しておく

サーバーを起動する

```
$ npm start
```

## Configuration

| Key        | Type     | Default   | Description |
|------------|----------|-----------|-------------|
| host       | string   |           | サーバーのホストネーム。CSPによるXSS対策のために用いている。production実行時には必ず付与すること。 |

## Special thanks

* [kosen10s](https://github.com/kosen10s) designチャンネルのメンバー : アイコンアドバイス
* [Ryosuke SATO (jtwp470)](https://github.com/jtwp470) : XSSアタック。XSS対策アドバイス

## License

MIT License

&copy; 2015-2016 SAKATA Sinji
