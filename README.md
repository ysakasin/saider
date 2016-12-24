# Saider

![Saider](public/image/logo.png)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/NKMR6194/saider)

ボイセ勢のためのオンセ支援ツール


[公式デモサーバー](https://saider.sakasin.net)

## 有志による公開サーバー

* [どどんとふ公式鯖](https://www.taruki.com/dodontof.html)
* [Saider こかげサーバー](https://cokage.works/saider/)

## Saiderでできること

* ルーム機能
  * パスワードによる入室制限
* ダイスロールの共有
* メモの共有
* マップの共有
  * 画像を表示するだけでコマ機能はありません

## これから実現したいこと

* コマ機能
* BGM再生
* 管理者用の機能

## Requirements

* Node.js (=> v4.0.0)
* npm
* Redis

## ローカルで動かす方法

ディレクトリに移動

```
$ cd saider
```

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

## サーバー管理者向けのコマンド

### cleanroom

一定時間アクセスアクセスされていないルームをまとめて削除する

```
npm run cleanroom
```

* LIMIT_DAY : 期限となる日数 (初期値 7)

## Configuration

| Key        | Default   | Description |
|------------|-----------|-------------|
| hostname   | "0.0.0.0" | サーバーのホストネーム。CSPによるXSS対策のために用いている。production実行時には必ず付与すること。 |
| port       | 80        | Listenするポート番号 |
| redis      | undefined | Redisのクライアント作成時に指定するオプション。詳細は node_redis の [README.md](https://github.com/NodeRedis/node_redis#options-object-properties) を参照すること。 |

## Special thanks

* [kosen10s](https://github.com/kosen10s) designチャンネルのメンバー : アイコンアドバイス
* [Ryosuke SATO (jtwp470)](https://github.com/jtwp470) : XSSアタック。XSS対策アドバイス

## License

MIT License

&copy; 2015-2016 SAKATA Sinji
