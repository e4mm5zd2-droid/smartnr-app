# SmartNR - Renderデプロイ手順

## 📋 前提条件

- [x] GitHubアカウント
- [x] Renderアカウント（https://render.com/）
- [x] Supabaseプロジェクト設定済み
- [x] xAI API Key取得済み

## 🚀 デプロイ手順

### 1. GitHubリポジトリ作成・プッシュ

```bash
cd /Users/apple/Projects/business3-kyoto-nightwork/nightwork-scout-app

# Git初期化
git init
git add .
git commit -m "Initial commit: SmartNR v1.0"

# GitHubリポジトリ作成後（https://github.com/new）
git remote add origin https://github.com/YOUR_USERNAME/smartnr-app.git
git branch -M main
git push -u origin main
```

### 2. Render Dashboard設定

#### 2.1 バックエンドデプロイ

1. https://dashboard.render.com/ にアクセス
2. 「New +」→「Web Service」をクリック
3. GitHubリポジトリ `smartnr-app` を選択
4. 以下を設定：
   - **Name**: `smartnr-backend`
   - **Region**: Singapore
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free（開発用）

5. **Environment Variables** を追加：
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_KEY=eyJhbGciOi...（service_role key）
   XAI_API_KEY=xai-xxxxx
   XAI_BASE_URL=https://api.x.ai/v1
   APP_NAME=SmartNR API
   DEBUG=false
   SECRET_KEY=（自動生成 or ランダム文字列）
   ALLOWED_ORIGINS=https://smartnr-frontend.onrender.com,https://smartnr.vercel.app
   ```

6. 「Create Web Service」をクリック

#### 2.2 フロントエンドデプロイ（Renderの場合）

1. 「New +」→「Web Service」をクリック
2. 同じGitHubリポジトリ `smartnr-app` を選択
3. 以下を設定：
   - **Name**: `smartnr-frontend`
   - **Region**: Singapore
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

4. **Environment Variables** を追加：
   ```
   NEXT_PUBLIC_API_URL=https://smartnr-backend.onrender.com
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...（anon public key）
   ```

5. 「Create Web Service」をクリック

### 3. Vercelデプロイ（フロントエンド推奨）

Renderより高速・無料枠が大きいためVercel推奨：

```bash
cd frontend

# Vercel CLIインストール（未インストールの場合）
npm install -g vercel

# デプロイ
vercel

# プロンプトに従って設定：
# - Set up and deploy "~/Projects/.../frontend"? Y
# - Which scope? （自分のアカウント選択）
# - Link to existing project? N
# - What's your project's name? smartnr
# - In which directory is your code located? ./
# - Want to modify these settings? N
```

Environment Variables設定（Vercel Dashboard）:
```
NEXT_PUBLIC_API_URL=https://smartnr-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...（anon public key）
```

本番デプロイ:
```bash
vercel --prod
```

## 🔍 デプロイ後確認

### バックエンド確認
```bash
curl https://smartnr-backend.onrender.com/health
# 期待: {"status":"healthy","app_name":"SmartNR API","debug":false}

curl https://smartnr-backend.onrender.com/api/stores
# 期待: [{"id":1,"name":"Club LION",...}]
```

### フロントエンド確認
- https://smartnr.vercel.app にアクセス
- ログインページが表示されることを確認
- 新規登録 → ダッシュボード表示を確認

## ⚙️ 環境変数一覧

### バックエンド (Render)
| 変数名 | 説明 | 例 |
|--------|------|-----|
| `DATABASE_URL` | Supabase PostgreSQL接続文字列 | `postgresql://postgres:...` |
| `SUPABASE_URL` | Supabase Project URL | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Supabase service_role key | `eyJhbGci...` |
| `XAI_API_KEY` | xAI API Key | `xai-xxxxx` |
| `XAI_BASE_URL` | xAI Base URL | `https://api.x.ai/v1` |
| `APP_NAME` | アプリ名 | `SmartNR API` |
| `DEBUG` | デバッグモード | `false` |
| `SECRET_KEY` | セッション暗号化キー | ランダム文字列 |
| `ALLOWED_ORIGINS` | CORS許可オリジン | `https://smartnr.vercel.app` |

### フロントエンド (Vercel/Render)
| 変数名 | 説明 | 例 |
|--------|------|-----|
| `NEXT_PUBLIC_API_URL` | バックエンドURL | `https://smartnr-backend.onrender.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key | `eyJhbGci...` |

## 🐛 トラブルシューティング

### デプロイ失敗（バックエンド）
```bash
# Renderログで確認：
# - Python version: 3.11以上か
# - requirements.txt: 全パッケージインストール成功か
# - 環境変数: 全て設定されているか
```

### CORS エラー
```bash
# backend/.env の ALLOWED_ORIGINS に本番URLを追加
ALLOWED_ORIGINS=https://smartnr.vercel.app,https://smartnr-frontend.onrender.com
```

### Supabase接続エラー
```bash
# DATABASE_URL の形式確認：
# postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres

# SUPABASE_KEY は service_role（バックエンド）、anon（フロントエンド）を使い分け
```

## 📊 デプロイ後のモニタリング

### Render Dashboard
- https://dashboard.render.com/
- 「Events」タブでデプロイ履歴確認
- 「Logs」タブでリアルタイムログ確認

### Vercel Dashboard
- https://vercel.com/dashboard
- デプロイ履歴・パフォーマンス確認
- Analytics（アクセス解析）確認

## 🚀 継続的デプロイ（CI/CD）

GitHubにプッシュすると自動デプロイされます：

```bash
# コード修正後
git add .
git commit -m "Update: 機能追加"
git push origin main

# → Render/Vercelが自動ビルド・デプロイ
```

## 💡 本番運用Tips

1. **無料プラン制限**
   - Render Free: スリープ15分後、初回アクセス時に起動（30秒程度）
   - 対策: UptimeRobot等で5分おきにヘルスチェック

2. **データベース**
   - Supabase Free: 500MB / 2GB転送量
   - 本番運用時はPro($25/月)推奨

3. **監視**
   - Sentry（エラー監視）
   - Google Analytics（アクセス解析）
   - UptimeRobot（死活監視）

---

**作成日**: 2026-02-14  
**更新日**: 2026-02-14
