# 給料計算自動化ガイド

## 実装済み機能 ✅

### 1. 自動計算エンジン
- **時給×勤務時間**: 基本報酬の自動計算
- **ボーナス加算**: 日次ボーナスの集計
- **ランクボーナス**: スカウトランクに応じた追加報酬
- **統計情報**: 勤務日数・総勤務時間・平均時給

### 2. 給料計算ウィジェット
- **勤務記録入力**: 日付・時間・時給・ボーナス
- **複数レコード対応**: 月間の全勤務を入力可能
- **リアルタイム計算**: 入力と同時に結果を表示
- **ランク選択**: GOAT/Charisma/Elite/Pro/Regular

### 3. 申請ワークフロー
- **4ステップ申請**: キャスト選択 → 店舗情報 → 金額入力 → 確認
- **自動入力**: 計算結果を申請フォームに自動反映
- **手動入力併用**: 自動計算と手動入力の選択可能

---

## 計算ロジック

### 基本報酬計算
```typescript
基本報酬 = Σ(勤務時間 × 時給)
```

**例:**
```
1日目: 8時間 × ¥3,000 = ¥24,000
2日目: 6時間 × ¥3,500 = ¥21,000
3日目: 8時間 × ¥3,000 = ¥24,000
──────────────────────────
基本報酬: ¥69,000
```

### ボーナス加算
```typescript
総ボーナス = Σ(日次ボーナス)
```

**例:**
```
1日目: ¥5,000 (指名ボーナス)
2日目: ¥0
3日目: ¥8,000 (売上達成)
──────────────────────────
総ボーナス: ¥13,000
```

### ランクボーナス
```typescript
ランクボーナス = 基本報酬 × ランク倍率
```

**ランク倍率:**
| ランク | 倍率 | 説明 |
|--------|------|------|
| GOAT | 30% | 最高ランク |
| Charisma | 20% | カリスマスカウト |
| Elite | 15% | エリート |
| Pro | 10% | プロフェッショナル |
| Regular | 5% | レギュラー |

**例（GOAT）:**
```
基本報酬: ¥69,000
ランクボーナス: ¥69,000 × 0.3 = ¥20,700
```

### 総支給額
```typescript
総支給額 = 基本報酬 + 総ボーナス + ランクボーナス
```

**例:**
```
基本報酬: ¥69,000
総ボーナス: ¥13,000
ランクボーナス: ¥20,700
──────────────────────────
総支給額: ¥102,700
```

---

## 使用方法

### ステップ1: キャスト選択
1. 申請対象のキャストを選択
2. 自動的に次のステップへ

### ステップ2: 店舗情報
1. 勤務店舗を選択
2. 勤務期間を入力（例: 2026年1月1日〜1月31日）

### ステップ3: 金額入力
**オプション A: 自動計算を使用**
1. スカウトランクを選択
2. 各勤務日の情報を入力:
   - 日付
   - 勤務時間
   - 時給
   - ボーナス（あれば）
3. 「追加」ボタンで勤務日を追加
4. 自動的に計算結果が反映される

**オプション B: 手動入力**
1. 基本報酬を直接入力
2. ボーナスを入力
3. 合計金額が自動計算される

### ステップ4: 確認・送信
1. 入力内容を最終確認
2. 「申請を送信」ボタンで完了

---

## 拡張機能

### 1. 歩合制計算（今後実装）
```typescript
歩合 = 売上 × 歩合率
```

**例:**
```
売上: ¥500,000
歩合率: 10%
歩合: ¥50,000
```

### 2. 成果ボーナス（今後実装）
```typescript
成果ボーナス = (達成数 - 目標数) × 単価 × 1.5
```

**例:**
```
目標: 5名獲得
達成: 8名獲得
超過: 3名
単価: ¥10,000
──────────────────────────
基本: ¥50,000 (5名 × ¥10,000)
超過分: ¥45,000 (3名 × ¥10,000 × 1.5)
合計: ¥95,000
```

### 3. 税金・控除計算（今後実装）
```typescript
手取り = 総支給額 - 所得税 - 住民税 - 社会保険料
```

**簡易計算例:**
```
総支給額: ¥100,000
所得税(5%): -¥5,000
住民税(3%): -¥3,000
社会保険(7%): -¥7,000
──────────────────────────
手取り: ¥85,000
```

---

## データベース設計

### salary_requests テーブル
```sql
CREATE TABLE salary_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id UUID REFERENCES scouts(id) ON DELETE CASCADE,
  cast_id UUID REFERENCES casts(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  work_period TEXT NOT NULL,
  base_amount DECIMAL(10, 2) NOT NULL,
  bonus_amount DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  rank_bonus DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  note TEXT,
  work_records JSONB,
  approved_by UUID REFERENCES scouts(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS有効化
ALTER TABLE salary_requests ENABLE ROW LEVEL SECURITY;

-- ポリシー
CREATE POLICY "Users can view own requests"
  ON salary_requests FOR SELECT
  USING (auth.uid() = scout_id);

CREATE POLICY "Users can insert own requests"
  ON salary_requests FOR INSERT
  WITH CHECK (auth.uid() = scout_id);
```

### work_records（JSON形式）
```json
[
  {
    "date": "2026-01-15",
    "hours": 8,
    "hourlyRate": 3000,
    "bonus": 5000
  },
  {
    "date": "2026-01-16",
    "hours": 6,
    "hourlyRate": 3500,
    "bonus": 0
  }
]
```

---

## API設計

### POST /api/salary/request
給料申請を作成

**リクエスト:**
```json
{
  "castId": "uuid",
  "shopId": "uuid",
  "workPeriod": "2026年1月",
  "baseAmount": 69000,
  "bonusAmount": 33700,
  "totalAmount": 102700,
  "note": "備考",
  "workRecords": [...]
}
```

**レスポンス:**
```json
{
  "id": "uuid",
  "status": "pending",
  "createdAt": "2026-01-31T10:00:00Z"
}
```

### GET /api/salary/requests
自分の申請一覧を取得

**レスポンス:**
```json
{
  "requests": [
    {
      "id": "uuid",
      "castName": "あやか",
      "shopName": "Club LION",
      "period": "2026年1月",
      "amount": 102700,
      "status": "approved",
      "createdAt": "2026-01-31T10:00:00Z"
    }
  ]
}
```

### PATCH /api/salary/requests/:id
申請ステータスを更新（承認者のみ）

**リクエスト:**
```json
{
  "status": "approved",
  "note": "承認しました"
}
```

---

## 承認ワークフロー

### ステータス遷移
```
pending（申請中）
  ↓
approved（承認済み）
  または
rejected（却下）
```

### 承認権限
- **スカウト本人**: 申請作成・編集・取り消し
- **管理者**: 全ての申請の承認・却下
- **上位スカウト**: 配下スカウトの申請を承認可能（将来実装）

### 通知
- **申請時**: 管理者に通知
- **承認時**: スカウト本人に通知
- **却下時**: スカウト本人に理由と共に通知

---

## テスト計算例

### ケース1: 新人スカウト（Regular）
```
勤務: 10日間、80時間、時給¥2,500
ボーナス: ¥20,000
ランク: Regular (5%)

基本報酬: ¥200,000
ボーナス: ¥20,000
ランクボーナス: ¥10,000 (¥200,000 × 5%)
──────────────────────────
総支給額: ¥230,000
```

### ケース2: GOATスカウト
```
勤務: 20日間、160時間、時給¥4,000
ボーナス: ¥100,000
ランク: GOAT (30%)

基本報酬: ¥640,000
ボーナス: ¥100,000
ランクボーナス: ¥192,000 (¥640,000 × 30%)
──────────────────────────
総支給額: ¥932,000
```

---

## トラブルシューティング

### 計算結果が0になる
- 勤務記録が入力されているか確認
- 時給・勤務時間がゼロになっていないか確認

### ランクボーナスが反映されない
- ランクが正しく選択されているか確認
- 基本報酬が0でないか確認

### 申請送信ができない
- 全ての必須項目が入力されているか確認
- ネットワーク接続を確認

---

## 今後の拡張予定

- [ ] 過去の申請履歴表示
- [ ] 申請ステータスのリアルタイム更新
- [ ] PDF形式の給料明細生成
- [ ] 自動承認ルール設定
- [ ] 月次レポート自動生成
- [ ] 銀行振込データ出力
- [ ] 年末調整データエクスポート
- [ ] モバイルアプリでの申請
