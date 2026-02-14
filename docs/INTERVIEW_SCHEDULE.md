# 面接スケジュール管理ガイド

## 実装済み機能 ✅

### 1. カレンダーUI
- **月次カレンダー**: 1ヶ月分の日付を表示
- **日付選択**: クリックで日付を選択
- **面接マーカー**: 面接予定がある日にドット表示
- **今日の強調表示**: 本日の日付をハイライト
- **月切り替え**: 前月・次月ボタン

### 2. 面接予定管理
- **面接追加**: ダイアログから新規予定を登録
- **面接情報**: キャスト名・日時・場所・メモ
- **ステータス管理**: 予定/確定/完了/キャンセル
- **店舗選択**: プリセットから選択

### 3. 面接リスト
- **本日の面接**: 今日の予定を上部に表示
- **今後の予定**: 近日中の面接を時系列順に表示
- **詳細表示**: 時刻・場所・ステータスを表示

---

## 使用方法

### 面接予定の追加
1. **「面接を追加」ボタン**をクリック
2. ダイアログで情報を入力:
   - **キャスト名**: 面接対象者の名前
   - **日付**: 面接日
   - **時刻**: 開始時刻
   - **場所**: 面接場所（店舗選択）
   - **メモ**: 特記事項（任意）
3. **「追加」ボタン**で登録完了

### カレンダーの操作
- **日付クリック**: その日の予定を表示
- **前月/次月ボタン**: 月を切り替え
- **ドット表示**: 面接予定がある日

### ステータス管理
- **予定（青）**: 仮予定
- **確定（緑）**: 確定済み
- **完了（グレー）**: 面接完了
- **キャンセル（赤）**: キャンセル

---

## データベース設計

### interviews テーブル
```sql
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id UUID REFERENCES scouts(id) ON DELETE CASCADE,
  cast_name TEXT NOT NULL,
  interview_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  note TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_interviews_scout_date ON interviews(scout_id, interview_date);
CREATE INDEX idx_interviews_status ON interviews(status);

-- RLS有効化
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- ポリシー
CREATE POLICY "Users can view own interviews"
  ON interviews FOR SELECT
  USING (auth.uid() = scout_id);

CREATE POLICY "Users can insert own interviews"
  ON interviews FOR INSERT
  WITH CHECK (auth.uid() = scout_id);

CREATE POLICY "Users can update own interviews"
  ON interviews FOR UPDATE
  USING (auth.uid() = scout_id);

CREATE POLICY "Users can delete own interviews"
  ON interviews FOR DELETE
  USING (auth.uid() = scout_id);
```

---

## API設計

### POST /api/interviews
面接予定を作成

**リクエスト:**
```json
{
  "castName": "あやか",
  "interviewDate": "2026-02-15T15:00:00Z",
  "location": "Club LION（祇園）",
  "note": "経験者、祇園エリア希望"
}
```

**レスポンス:**
```json
{
  "id": "uuid",
  "status": "scheduled",
  "createdAt": "2026-02-12T10:00:00Z"
}
```

### GET /api/interviews
面接予定一覧を取得

**クエリパラメータ:**
- `month`: 月（YYYY-MM）
- `status`: ステータスフィルタ

**レスポンス:**
```json
{
  "interviews": [
    {
      "id": "uuid",
      "castName": "あやか",
      "interviewDate": "2026-02-15T15:00:00Z",
      "location": "Club LION（祇園）",
      "status": "scheduled",
      "note": "経験者"
    }
  ]
}
```

### PATCH /api/interviews/:id
面接予定を更新

**リクエスト:**
```json
{
  "status": "confirmed",
  "note": "面接確定"
}
```

### DELETE /api/interviews/:id
面接予定を削除

---

## リマインダー機能

### プッシュ通知
面接の24時間前と1時間前に通知

**通知タイミング:**
- **24時間前**: "明日15:00に「あやか」さんの面接予定があります"
- **1時間前**: "まもなく面接です（14:00〜）"

### メール通知（今後実装）
```
件名: 【SmartNR】面接予定のお知らせ

京極 蓮 様

明日、以下の面接予定があります。

■ キャスト名: あやか
■ 日時: 2026年2月15日 15:00
■ 場所: Club LION（祇園）
■ メモ: 経験者、祇園エリア希望

準備をお願いいたします。

SmartNR
```

---

## カレンダー連携（今後実装）

### Google Calendar連携
```typescript
// iCalendar形式でエクスポート
const event = {
  summary: '面接: あやか',
  location: 'Club LION（祇園）',
  description: '経験者、祇園エリア希望',
  start: {
    dateTime: '2026-02-15T15:00:00+09:00',
    timeZone: 'Asia/Tokyo',
  },
  end: {
    dateTime: '2026-02-15T16:00:00+09:00',
    timeZone: 'Asia/Tokyo',
  },
  reminders: {
    useDefault: false,
    overrides: [
      { method: 'popup', minutes: 60 },
      { method: 'popup', minutes: 1440 },
    ],
  },
};
```

### Apple Calendar / Outlook対応
- **.ics ファイル**でエクスポート
- 各カレンダーアプリにインポート可能

---

## 統計・分析機能（今後実装）

### 月次レポート
```typescript
interface MonthlyReport {
  month: string;
  totalInterviews: number;
  completedInterviews: number;
  cancelledInterviews: number;
  conversionRate: number; // 完了率
  averagePerWeek: number;
}
```

### キャスト獲得数
```typescript
interface ConversionStats {
  interviews: number;
  hired: number;
  conversionRate: number;
}
```

---

## ベストプラクティス

### 面接予定の管理
1. **予定は早めに登録**: 最低でも3日前に登録
2. **リマインダー設定**: 通知を有効にする
3. **メモ活用**: 特記事項を必ず記入
4. **ステータス更新**: 面接後は速やかに更新

### 効率的なスケジューリング
1. **時間帯の固定**: 同じ時間帯にまとめる
2. **場所の最適化**: 近い店舗を連続で設定
3. **余裕を持つ**: 面接間は最低1時間空ける
4. **キャンセル対応**: 代替日程を即座に提案

---

## トラブルシューティング

### カレンダーが表示されない
1. ブラウザのキャッシュをクリア
2. JavaScriptが有効か確認
3. ページをリロード

### 面接が追加できない
1. 必須項目が全て入力されているか確認
2. 日付・時刻の形式が正しいか確認
3. ネットワーク接続を確認

### リマインダーが届かない
1. プッシュ通知権限を確認
2. アプリの通知設定を確認
3. ブラウザの通知設定を確認

---

## 今後の拡張予定

- [ ] Google Calendar連携
- [ ] iCalendar (.ics) エクスポート
- [ ] メール通知
- [ ] LINE通知
- [ ] 面接結果の記録
- [ ] キャスト獲得率の分析
- [ ] 週間ビュー・日次ビュー
- [ ] ドラッグ&ドロップで予定変更
- [ ] 繰り返し予定の設定
- [ ] チーム共有カレンダー
- [ ] 面接評価フォーム
- [ ] 自動スケジュール提案
