# SmartNR - Night Work Recruit

ナイトワークキャスト管理システム - AI顔分析・店舗マッチング機能搭載

## 🎯 主要機能

- ✅ **AI顔分析**: xAI Grok Visionで写真から年齢・雰囲気を自動判定
- ✅ **店舗レコメンド**: AIマッチングアルゴリズムで最適店舗を提案
- ✅ **キャスト管理**: 求職者の登録・管理・ステータス追跡
- ✅ **店舗管理**: 提携店舗の情報管理
- 🔜 **給料申請**: スカウトマンの報酬申請フロー
- 🔜 **AI Concierge**: チャットで店舗提案

## 🏗️ 技術スタック

### バックエンド
- **Python 3.9+**
- **FastAPI** - 高速APIフレームワーク
- **Supabase (PostgreSQL)** - クラウドデータベース
- **xAI Grok Vision API** - AI画像分析
- **SQLAlchemy** - ORM
- **Pydantic** - データバリデーション

### フロントエンド
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Shadcn/ui** - UIコンポーネント
- **Lucide React** - アイコン

### インフラ
- **Supabase** - Database Hosting
- **Render.com / Railway** - Backend Hosting（予定）
- **Vercel** - Frontend Hosting（予定）

## 📂 プロジェクト構造

```
nightwork-scout-app/
├── backend/              # FastAPI バックエンド
│   ├── app/
│   │   ├── main.py      # FastAPIアプリケーション
│   │   ├── core/        # 設定・DB接続
│   │   ├── models/      # データモデル
│   │   ├── schemas/     # Pydanticスキーマ
│   │   └── routers/     # APIエンドポイント
│   ├── .env             # 環境変数
│   ├── requirements.txt # Python依存関係
│   └── venv/            # Python仮想環境
│
└── frontend/            # Next.js フロントエンド
    ├── app/             # ページ（App Router）
    ├── components/      # Reactコンポーネント
    ├── lib/             # ユーティリティ
    └── public/          # 静的ファイル
```

## 🚀 セットアップ手順

### 1. リポジトリクローン

```bash
git clone <repository-url>
cd nightwork-scout-app
```

### 2. バックエンドセットアップ

```bash
cd backend

# Python仮想環境作成
python3 -m venv venv

# 仮想環境アクティベート
source venv/bin/activate  # Mac/Linux
# または
venv\Scripts\activate     # Windows

# 依存関係インストール
pip install -r requirements.txt

# 環境変数設定
cp .env.example .env
# .envファイルを編集して以下を設定：
# - SUPABASE_URL
# - SUPABASE_KEY
# - XAI_API_KEY
# - DATABASE_URL
```

### 3. Supabaseセットアップ

#### 3.1 Supabaseプロジェクト作成

1. https://supabase.com/ にアクセス
2. 新規プロジェクト作成
3. Region: `Northeast Asia (Tokyo)` 選択
4. Database Passwordを設定（メモ必須）

#### 3.2 テーブル作成

SQL Editorで以下を実行：

```sql
-- scouts, shops, casts, interviews テーブルを作成
-- （詳細はbackend/schema.sqlを参照）
```

#### 3.3 接続情報取得（バックエンド）

- Settings → API → **Legacy anon, service_role API keys**
- `service_role` キーをコピー → `backend/.env` の `SUPABASE_KEY` に設定
- `Project URL` をコピー → `backend/.env` の `SUPABASE_URL` に設定
- Settings → Database → Connection string → URI をコピー → `DATABASE_URL` に設定

#### 3.4 認証設定（フロントエンド）

- Settings → API → **Project API keys**
- `anon public` キーをコピー → `frontend/.env.local` の `NEXT_PUBLIC_SUPABASE_ANON_KEY` に設定
- `Project URL` をコピー → `frontend/.env.local` の `NEXT_PUBLIC_SUPABASE_URL` に設定

**フロントエンド `.env.local` の例:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://xwnqacxsuppwpikqtlum.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi... (anon public key)
```

### 4. xAI APIセットアップ

1. https://console.x.ai/ でアカウント作成
2. API Key作成
3. `.env` の `XAI_API_KEY` に設定

### 5. フロントエンドセットアップ

```bash
cd frontend

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

## 🎮 起動方法

### ターミナル1: バックエンド起動

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

起動確認: http://localhost:8000/docs

### ターミナル2: フロントエンド起動

```bash
cd frontend
npm run dev
```

起動確認: http://localhost:3000

## 📡 APIエンドポイント

### CRUD API

| Method | Endpoint | 説明 |
|--------|----------|------|
| POST | `/api/job-seekers` | 求職者登録 |
| GET | `/api/job-seekers` | 求職者一覧 |
| GET | `/api/job-seekers/{id}` | 求職者詳細 |
| PATCH | `/api/job-seekers/{id}` | 求職者更新 |
| DELETE | `/api/job-seekers/{id}` | 求職者削除 |
| POST | `/api/stores` | 店舗登録 |
| GET | `/api/stores` | 店舗一覧 |
| GET | `/api/stores/{id}` | 店舗詳細 |

### AI機能

| Method | Endpoint | 説明 |
|--------|----------|------|
| POST | `/api/analyze-face` | 顔画像分析（年齢・タグ・髪型） |
| GET | `/api/shops/recommend` | AIマッチング店舗レコメンド |

## 🧪 動作確認

### 1. バックエンドAPI確認

```bash
curl http://localhost:8000/health
# 期待レスポンス: {"status":"healthy",...}

curl http://localhost:8000/api/stores
# 期待レスポンス: [{"id":1,"name":"Club LION",...},...]
```

### 2. フロントエンド確認

1. http://localhost:3000 にアクセス
2. Dashboard表示を確認
3. 「新規キャスト登録」をクリック
4. 写真をアップロード → AI分析 → 店舗レコメンド表示を確認

### 3. AI顔分析テスト

1. `/casts/new` ページで写真アップロード
2. 「AI分析中...」ローディング表示
3. 推定年齢・タグ・髪型が自動表示
4. おすすめ店舗が5件表示

## 🐛 トラブルシューティング

### CORS エラー

```
Access to fetch at 'http://localhost:8000/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**解決策**: `backend/.env` の `ALLOWED_ORIGINS` に `http://localhost:3000` が含まれているか確認

### Supabase接続エラー

```
SupabaseException: Invalid API key
```

**解決策**: 
1. `.env` の `SUPABASE_KEY` が **Legacy service_role** キー（`eyJ...`形式）であることを確認
2. 新しい `sb_secret_...` 形式は非対応

### xAI API エラー

```
Error code: 403 - Your newly created team doesn't have any credits
```

**解決策**: https://console.x.ai/ でクレジット購入

### 画像アップロードエラー

```
画像分析に失敗しました
```

**解決策**: 
1. バックエンドターミナルでエラーログ確認
2. xAI API Keyが正しく設定されているか確認
3. 画像サイズが大きすぎる場合は縮小（推奨: 1MB以下）

## 🌐 デプロイ（TODO）

### バックエンド (Render.com)

```bash
# render.yaml設定
# 環境変数をRender Dashboardで設定
```

### フロントエンド (Vercel)

```bash
vercel deploy
# 環境変数: NEXT_PUBLIC_API_URL=<バックエンドURL>
```

## 📝 環境変数一覧

### バックエンド (.env)

```env
# データベース
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJhbGciOi... (Legacy service_role)

# xAI API
XAI_API_KEY=xai-xxxxx
XAI_BASE_URL=https://api.x.ai/v1

# アプリケーション
APP_NAME=Nightwork Scout API
DEBUG=True
SECRET_KEY=your-secret-key

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

### フロントエンド (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📊 データベーススキーマ

### scouts（スカウトマン）
- id, name, email, created_at

### shops（店舗）
- id, name, area, system_type, hourly_wage_min, hourly_wage_max
- target_age_min, target_age_max, description, created_at

### casts（キャスト）
- id, scout_id, genji_name, real_name_initial, age, phone
- line_id, looks_tags (JSONB), status, photos_url, created_at

### interviews（面接履歴）
- id, cast_id, shop_id, interview_date, result, feedback, created_at

## 🎨 UIデザインコンセプト

- **ブランド名**: SmartNR（Smart Night Recruit）
- **メインカラー**: `#00C4CC` (SmartHR Blue)
- **ベース**: ダークモード（Slate系 - 濃いネイビー/黒グレー）
- **アクセント**: SmartHR Blueグラデーション + ネオン発光効果
- **参考**: SmartHR、Vercel Dashboard、Linear、Notion
- **特徴**: グラスモーフィズム、カード設計、スムーズなアニメーション、ネオンエフェクト
- **Mobile First**: iPhone最適化
- **認証**: Supabase Auth統合

## 📱 対応デバイス

- ✅ iPhone (iOS Safari)
- ✅ Android (Chrome)
- ✅ Desktop (Chrome, Safari, Firefox)

## 👥 開発チーム

- **株式会社 on the edge**
- 代表: テラス孝之
- 開発: 松本
- AI: KURODO

## 📄 ライセンス

Private - All Rights Reserved

---

**作成日**: 2026-02-12  
**最終更新**: 2026-02-12
