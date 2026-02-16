-- ════════════════════════════════════════
-- SmartNR: スカウト紹介トラッキングシステム
-- 実行先: Supabase SQL Editor
-- ════════════════════════════════════════

-- ════════════════════════════════════════
-- スカウト紹介リンク（QR＋短縮URLの発行元）
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS scout_links (
  id SERIAL PRIMARY KEY,
  scout_id INTEGER REFERENCES scouts(id) NOT NULL,
  
  -- リンクタイプ
  link_type TEXT NOT NULL,
  -- 'recruit'     → キャスト募集用（女の子を店に紹介）
  -- 'app_invite'  → キャバ嬢アプリ紹介用（既存キャバ嬢にアプリを紹介）
  
  -- リンク情報
  unique_code TEXT UNIQUE NOT NULL,                  -- "KYOGOKU-RCT-A1B2" or "KYOGOKU-APP-X7K9"
  short_url TEXT NOT NULL,                           -- "https://smartnr.app/r/KYOGOKU-RCT-A1B2"
  qr_code_path TEXT DEFAULT '',                      -- QR画像のパス（生成後に格納）
  
  -- リンクA（recruit）専用
  shop_id INTEGER REFERENCES shops(id),              -- 紹介先店舗（recruitの場合。NULLなら全店舗対象）
  
  -- ミニLPカスタマイズ
  lp_headline TEXT DEFAULT '',                       -- LPの見出し（空ならデフォルト）
  lp_description TEXT DEFAULT '',                    -- LPの説明文（空ならデフォルト）
  lp_template TEXT DEFAULT 'default',                -- 'default' | 'luxury' | 'casual'
  
  -- 実績
  click_count INTEGER DEFAULT 0,
  submission_count INTEGER DEFAULT 0,                -- 応募/登録数
  
  -- 強制停止（マスター権限）
  force_disabled BOOLEAN DEFAULT false,
  force_disabled_reason TEXT DEFAULT '',
  force_disabled_by INTEGER REFERENCES scouts(id),
  force_disabled_at TIMESTAMP,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ════════════════════════════════════════
-- クリックログ
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS link_clicks (
  id SERIAL PRIMARY KEY,
  link_id INTEGER REFERENCES scout_links(id) NOT NULL,
  ip_address TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  referer TEXT DEFAULT '',
  clicked_at TIMESTAMP DEFAULT NOW()
);

-- ════════════════════════════════════════
-- 応募/登録（リンク経由のコンバージョン）
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS link_conversions (
  id SERIAL PRIMARY KEY,
  link_id INTEGER REFERENCES scout_links(id) NOT NULL,
  scout_id INTEGER REFERENCES scouts(id) NOT NULL,
  
  conversion_type TEXT NOT NULL,
  -- 'recruit_apply'    → キャスト募集への応募
  -- 'app_register'     → キャバ嬢アプリへの登録
  
  -- 応募者/登録者の情報
  name TEXT NOT NULL,
  line_id TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  age INTEGER,
  
  -- リンクA（recruit）用の追加フィールド
  shop_id INTEGER REFERENCES shops(id),              -- 紹介先店舗
  cast_id INTEGER REFERENCES casts(id),              -- キャスト登録後に紐づけ
  
  -- ファネルステータス
  status TEXT DEFAULT 'submitted',
  -- recruitの場合:    'submitted' → 'contacted' → 'interviewed' → 'trial' → 'hired' → 'active'
  -- app_inviteの場合: 'submitted' → 'registered' → 'active' → 'churned'
  
  -- 各ステータスの日時
  submitted_at TIMESTAMP DEFAULT NOW(),
  contacted_at TIMESTAMP,
  interviewed_at TIMESTAMP,
  trial_at TIMESTAMP,
  hired_at TIMESTAMP,
  registered_at TIMESTAMP,                           -- アプリ登録完了日（app_invite用）
  
  -- SB計算（recruit用）
  estimated_monthly_sales NUMERIC DEFAULT 0,
  sb_rate NUMERIC(5,2),
  sb_amount NUMERIC DEFAULT 0,
  scout_share_rate NUMERIC(5,2) DEFAULT 70,
  scout_income NUMERIC DEFAULT 0,
  is_sb_paid BOOLEAN DEFAULT false,
  sb_paid_at TIMESTAMP,
  
  notes TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ════════════════════════════════════════
-- スカウトのトラッキング集計（ビュー）
-- ════════════════════════════════════════
CREATE OR REPLACE VIEW scout_link_stats AS
SELECT 
  sl.scout_id,
  sl.link_type,
  COUNT(DISTINCT sl.id) as total_links,
  SUM(sl.click_count) as total_clicks,
  SUM(sl.submission_count) as total_submissions,
  ROUND(
    SUM(sl.submission_count)::numeric / NULLIF(SUM(sl.click_count), 0) * 100, 1
  ) as cvr_percent
FROM scout_links sl
GROUP BY sl.scout_id, sl.link_type;

-- ════════════════════════════════════════
-- インデックス
-- ════════════════════════════════════════
CREATE UNIQUE INDEX IF NOT EXISTS idx_link_code ON scout_links(unique_code);
CREATE INDEX IF NOT EXISTS idx_link_scout ON scout_links(scout_id);
CREATE INDEX IF NOT EXISTS idx_link_type ON scout_links(link_type);
CREATE INDEX IF NOT EXISTS idx_conv_scout ON link_conversions(scout_id);
CREATE INDEX IF NOT EXISTS idx_conv_status ON link_conversions(status);
CREATE INDEX IF NOT EXISTS idx_conv_type ON link_conversions(conversion_type);
CREATE INDEX IF NOT EXISTS idx_click_link ON link_clicks(link_id);

-- ════════════════════════════════════════
-- 確認クエリ
-- ════════════════════════════════════════
SELECT 
  table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('scout_links', 'link_clicks', 'link_conversions')
ORDER BY table_name;
