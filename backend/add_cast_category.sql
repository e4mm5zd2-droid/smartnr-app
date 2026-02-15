-- ============================================================
-- SmartNR: casts テーブルにカテゴリ分類カラムを追加
-- 実行先: Supabase SQL Editor
-- ============================================================

-- is_new: 新人フラグ
ALTER TABLE casts 
  ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT true;

-- cast_category: カテゴリ分類
ALTER TABLE casts 
  ADD COLUMN IF NOT EXISTS cast_category TEXT DEFAULT 'new';

-- current_shop: 現在の所属店舗（activeの場合）
ALTER TABLE casts
  ADD COLUMN IF NOT EXISTS current_shop TEXT;

-- cast_categoryのCHECK制約
ALTER TABLE casts
  ADD CONSTRAINT casts_category_check
  CHECK (cast_category IN ('new', 'experience', 'active', 'returner'));

-- 既存データの初期化（experienceに基づく自動分類）
UPDATE casts
SET 
  is_new = CASE WHEN experience = '未経験' THEN true ELSE false END,
  cast_category = CASE 
    WHEN experience = '未経験' THEN 'new'
    WHEN status = '稼働中' THEN 'active'
    ELSE 'experience'
  END
WHERE cast_category = 'new';  -- 冪等性確保

-- 確認クエリ
SELECT id, genji_name, age, experience, status, is_new, cast_category, current_shop
FROM casts
ORDER BY is_new DESC, created_at DESC;
