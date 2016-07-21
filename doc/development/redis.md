# Redis

| Key           | Type     | Description |
|---------------|----------|-------------|
| room          | Hash     | key:ルームID, value:ルーム名 |
| password      | Hash     | key:ルームID, value:Hash化したパスワード |
| dicebot       | Hash     | key:ルームID, value:ダイスボットのID |
| result.`id`   | List     | JSON形式のダイスロール結果 |
| memo_id       | Hash     | key:ルームID, value:最後に発行したメモのID |
| memo.`id`     | Hash     | key:メモID, value:JSON形式のメモ情報 |
| map           | Hash     | key:ルームID, value:URL |
| time          | Hash     | key:ルームID, value:協定世界時から経過したミリ秒 ルームが作成されたときおよびルームにログイン/ログアウトした時に更新される |

## JSONのスキーマ

### results.`id`

| Key           | Type     | Description |
|---------------|----------|-------------|
| name          | String   | 実行したユーザー名 |
| text          | String   | リクエストと実行結果の両方を示すテキスト |

### memos.`id`

| Key           | Type     | Description |
|---------------|----------|-------------|
| memo_id       | String   | |
| title         | String   | |
| body          | String   | |
