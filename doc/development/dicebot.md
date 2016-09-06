# ダイスボット

Saiderの仕様にそったプログラムを作成することで、各システムに応じたダイスボットを作成することができます。

クトゥルフ神話TRPGに対応したダイスボットの作成例が `lib/dicebot/cthulhu.js` 配置されています。
本ドキュメントと合わせて参照してください。

## 実装可能なコマンドの種類

| Type         | Example       | Description |
| ------------ | ------------- | ----------- |
| Prefix       | CC(99)+10<=70 | 関数に類するコマンド |
| Infix        | 3LH+1>=10     | 中置記法のコマンド |
| Special case |               | 上記に属さない特殊ケース |

## ダイスボットが満たすべき仕様

1.標準ダイスボットである `DiceBot`クラスを継承すること。

2.以下のオブジェクトを持つこと

| Name        | Type   | Description |
| ----------- | ------ | ----------- |
| name        | String | ダイスボット名 |
| description | String | ダイスボットの使用方法等 |
| prefix      | Array  | Prefixコマンドどして認識する文字列の一覧 |
| infix       | Array  | Indixコマンドとして認識する文字列の一覧 |

3.以下のメソッドを持つこと

| Name            | Description |
| --------------- | ----------- |
| specialCase     | スペシャルコマンドの結果 |
| getPrefixResult | Prefixコマンドの結果 |
| getInfixResult  | Infixコマンドの結果 |

## specialCase(request)

PrefixでもInfixでも記述できない特殊なケースのコマンドに対応する

### 引数

* request : String : ユーザーが入力したダイスロールリクエストの文字列

### 戻り値

コマンドの実行結果を返す

```
{
    dices: [{
        n: Number, // 振ったダイスの数
        d: Number, // ダイスの面数
        numbers: [Number], // それぞれのダイスの出目
        total: Number // ダイスの出目の合計値
    }],
    total: Number or null, // コマンドの結果となる値
    result: String or null // コマンド実行の結果（成功/失敗 など）
}
```

該当がない場合は`null`を戻り値とすること。

## getPrefixResult(request)

Prefixコマンドを実装する

### 引数

引数requestは以下のメンバを持つ

| Name   | Type          | Example               | Description |
| ------ | ------------- | --------------------- | ----------- |
| body   | String        | `"CMD(99,29)-10<=90"` | リクエスト文全体 |
| prefix | String        | `"CMD"`               | Prefixの文字列 |
| args   | Array[String] | `[ "99", "29" ]`      | Prefixコマンドへの引数 |
| offset | Number        | `-10`                 | Prefixコマンドのオフセット |
| comp   | String        | `"<="`                | 比較記号 |
| lhs    | Number        | `90`                  | 比較記号の右辺 |

### 戻り値

`specialCase`と同様である

## getInfixResult(request)

Infixコマンドを実装する

### 引数

引数requestは以下のメンバを持つ

| Name   | Type          | Example          | Description |
| ------ | ------------- | ---------------- | ----------- |
| body   | String        | `"1PL23+10<=90"` | リクエスト文全体 |
| infix  | String        | `"PL"`           | Infixの文字列 |
| head   | Number        | `1`              | Infixの左辺にある数値 |
| tail   | Number        | `23`             | Infixの右辺にある数値 |
| offset | Number        | `10`             | Prefixコマンドのオフセット |
| comp   | String        | `"<="`           | 比較記号 |
| lhs    | Number        | `90`             | 比較記号の右辺 |

### 戻り値

`specialCase`と同様である

## 比較記号

現在、PrefixおよびInfixで比較記号として認識するのは以下の記号である。

* `<`
* `>`
* `<=`
* `>=`

## 実際に使うために

`example.js`というファイル名でダイスボットを作成したとする。

1.ソースコードを `lib/dicebot` 以下に配置する

2.`saider.js` の`dicebotList`を以下のように、 `example` のキーを追加する。この時、キーはファイル名のベースネームである必要がある

```
var dicebotList = {
  'example': 'サンプルダイスボット',
  'dicebot': '標準ダイスボット',
  'cthulhu': 'クトゥルフ神話TRPG'
};
```

3.Saiderを再起動する
