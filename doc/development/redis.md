# Redis

| Key           | Type     | Description |
|---------------|----------|-------------|
| rooms         | Hash     | key:ルームID, value:ルーム名 |
| results.`id`  | List     | JSON形式のダイスロール結果 |
| memo_id.`id`  | String   | メモの通し番号を管理する |
| memos.`id`    | Hash     | key:メモID, value:JSON形式のメモ情報 |
| map.`id`      | String   | URL |

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
