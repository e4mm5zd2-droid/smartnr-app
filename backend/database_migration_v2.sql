-- ================================================
-- SmartNR Database Schema Extension
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

-- 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE '✅ SmartNR Database Schema Extension 完了';
  RAISE NOTICE '   - shops: 10カラム追加（バック率、採用状況、報酬設定等）';
  RAISE NOTICE '   - casts: 4カラム追加（経験、性格、希望エリア、優先条件）';
END $$;
