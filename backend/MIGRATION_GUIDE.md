# SmartNR Database Migration v2 実行手順

## 📋 実行内容

### 1. shopsテーブル拡張（10カラム追加）
- `back_rate`: バック率（%）
- `manager_name`: 店長名
- `manager_tip`: 店長からのアドバイス
- `hiring_status`: 採用状況（active/limited/closed）
- `atmosphere_tags`: 雰囲気タグ（JSON配列）
- `education_level`: 教育体制（none/basic/standard/excellent）
- `sb_type`: スカウトマン報酬タイプ
- `sb_rate`: スカウトマン報酬率（%）
- `sb_note`: 報酬備考
- `payment_cycle`: 給料支払いサイクル

### 2. castsテーブル拡張（4カラム追加）
- `experience`: 経験（未経験/半年未満/1年以上/3年以上）
- `personality`: 性格・特徴
- `preferred_area`: 希望エリア
- `priority`: 優先条件（高時給/働きやすさ/知名度/成長環境）

## 🚀 Supabase SQL Editorでの実行手順

### ステップ1: Supabase Dashboardにアクセス

1. https://supabase.com/ にログイン
2. プロジェクト `xwnqacxsuppwpikqtlum` を選択
3. 左メニューから「**SQL Editor**」をクリック

### ステップ2: 新しいクエリを作成

1. 「**New query**」ボタンをクリック
2. クエリ名を入力（例: `SmartNR Schema v2 Migration`）

### ステップ3: SQLを貼り付けて実行

以下のSQLをコピーして貼り付け、「**Run**」をクリック：

\`\`\`sql
-- ================================================
-- SmartNR Database Schema Extension v2
-- AIマッチング・報酬計算機能強化
-- ================================================

-- 1. shopsテーブル拡張
ALTER TABLE shops ADD COLUMN IF NOT EXISTS back_rate INTEGER DEFAULT 50 CHECK (back_rate >= 0 AND back_rate <= 100);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS manager_name TEXT DEFAULT '';
ALTER TABLE shops ADD COLUMN IF NOT EXISTS manager_tip TEXT DEFAULT '';
ALTER TABLE shops ADD COLUMN IF NOT EXISTS hiring_status TEXT DEFAULT 'active' CHECK (hiring_status IN ('active', 'limited', 'closed'));
ALTER TABLE shops ADD COLUMN IF NOT EXISTS atmosphere_tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS education_level TEXT DEFAULT 'standard' CHECK (education_level IN ('none', 'basic', 'standard', 'excellent'));
ALTER TABLE shops ADD COLUMN IF NOT EXISTS sb_type TEXT DEFAULT 'sales_percentage' CHECK (sb_type IN ('sales_percentage', 'salary_percentage', 'fixed'));
ALTER TABLE shops ADD COLUMN IF NOT EXISTS sb_rate NUMERIC(5,2) DEFAULT 20.00 CHECK (sb_rate >= 0 AND sb_rate <= 100);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS sb_note TEXT DEFAULT '';
ALTER TABLE shops ADD COLUMN IF NOT EXISTS payment_cycle TEXT DEFAULT 'monthly' CHECK (payment_cycle IN ('daily', 'weekly', 'biweekly', 'monthly'));

-- 2. castsテーブル拡張
ALTER TABLE casts ADD COLUMN IF NOT EXISTS experience TEXT DEFAULT '未経験' CHECK (experience IN ('未経験', '半年未満', '1年以上', '3年以上'));
ALTER TABLE casts ADD COLUMN IF NOT EXISTS personality TEXT DEFAULT '';
ALTER TABLE casts ADD COLUMN IF NOT EXISTS preferred_area TEXT DEFAULT '';
ALTER TABLE casts ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT '働きやすさ' CHECK (priority IN ('高時給', '働きやすさ', '知名度', '成長環境'));

-- 3. コメント追加（ドキュメント用）
COMMENT ON COLUMN shops.back_rate IS 'バック率（%）: 0-100';
COMMENT ON COLUMN shops.manager_name IS '店長名';
COMMENT ON COLUMN shops.manager_tip IS '店長からのアドバイス・メッセージ';
COMMENT ON COLUMN shops.hiring_status IS '採用状況: active(積極採用), limited(条件付き), closed(募集停止)';
COMMENT ON COLUMN shops.atmosphere_tags IS '店舗雰囲気タグ（JSON配列）: ["アットホーム", "高級志向", "若手歓迎"]等';
COMMENT ON COLUMN shops.education_level IS '教育体制: none(なし), basic(基礎のみ), standard(標準), excellent(充実)';
COMMENT ON COLUMN shops.sb_type IS 'スカウトマン報酬タイプ: sales_percentage(売上%), salary_percentage(給料%), fixed(固定額)';
COMMENT ON COLUMN shops.sb_rate IS 'スカウトマン報酬率（%）: sb_typeがpercentageの場合';
COMMENT ON COLUMN shops.sb_note IS 'スカウトマン報酬備考';
COMMENT ON COLUMN shops.payment_cycle IS '給料支払いサイクル: daily(日払い), weekly(週払い), biweekly(2週), monthly(月払い)';

COMMENT ON COLUMN casts.experience IS '経験: 未経験, 半年未満, 1年以上, 3年以上';
COMMENT ON COLUMN casts.personality IS '性格・特徴（自由記述）';
COMMENT ON COLUMN casts.preferred_area IS '希望エリア: 祇園, 木屋町, 先斗町等';
COMMENT ON COLUMN casts.priority IS '優先条件: 高時給, 働きやすさ, 知名度, 成長環境';

-- 確認クエリ
SELECT 
  'shops' as table_name,
  COUNT(*) FILTER (WHERE column_name IN ('back_rate', 'manager_name', 'hiring_status', 'atmosphere_tags', 'education_level', 'sb_type', 'sb_rate', 'sb_note', 'payment_cycle', 'manager_tip')) as new_columns_count
FROM information_schema.columns 
WHERE table_name = 'shops'
UNION ALL
SELECT 
  'casts' as table_name,
  COUNT(*) FILTER (WHERE column_name IN ('experience', 'personality', 'preferred_area', 'priority')) as new_columns_count
FROM information_schema.columns 
WHERE table_name = 'casts';
\`\`\`

### ステップ4: 実行結果を確認

実行成功すると、以下のような結果が表示されます：

| table_name | new_columns_count |
|------------|-------------------|
| shops      | 10                |
| casts      | 4                 |

✅ この結果が表示されれば、マイグレーション成功です！

## 📊 追加されたカラムの確認

### shopsテーブル確認クエリ

\`\`\`sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'shops'
  AND column_name IN ('back_rate', 'manager_name', 'hiring_status', 'atmosphere_tags', 'education_level', 'sb_type', 'sb_rate', 'sb_note', 'payment_cycle', 'manager_tip')
ORDER BY column_name;
\`\`\`

### castsテーブル確認クエリ

\`\`\`sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'casts'
  AND column_name IN ('experience', 'personality', 'preferred_area', 'priority')
ORDER BY column_name;
\`\`\`

## 🎯 次のステップ

マイグレーション完了後：

1. ✅ バックエンドモデル更新済み（`backend/app/models/__init__.py`）
2. ✅ Pydanticスキーマ更新済み（`backend/app/schemas/__init__.py`）
3. 🔄 バックエンドAPIエンドポイント実装（AIマッチング・報酬計算）
4. 🔄 フロントエンド機能追加（マッチングUI、報酬シミュレーター）

## 🐛 トラブルシューティング

### エラー: "column already exists"

すでにカラムが存在する場合は正常です。`IF NOT EXISTS`により安全に実行されます。

### エラー: "permission denied"

Supabase Dashboardの権限を確認してください。Admin権限が必要です。

---

**作成日**: 2026-02-14  
**バージョン**: v2.0
