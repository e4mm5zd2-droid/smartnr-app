# デプロイメントガイド

Night Scout App のデプロイ手順書

## 目次

1. [バックエンドデプロイ（Render.com）](#バックエンドデプロイrendercom)
2. [フロントエンドデプロイ（Vercel）](#フロントエンドデプロイvercel)
3. [環境変数設定](#環境変数設定)
4. [デプロイ後の確認](#デプロイ後の確認)

---

## バックエンドデプロイ（Render.com）

### 1. Renderアカウント作成

https://render.com/ でアカウント作成

### 2. 新しいWeb Serviceを作成

1. Dashboard → "New" → "Web Service"
2. GitHubリポジトリを接続
3. `backend` ディレクトリを指定

### 3. サービス設定

| 項目 | 設定値 |
|-----|------|
| Name | `nightwork-scout-api` |
| Region | `Singapore` または `Oregon` |
| Branch | `main` |
| Root Directory | `backend` |
| Runtime | `Python 3` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Instance Type | `Free` または `Starter` |

### 4. 環境変数設定（Render Dashboard）

Environment → Add Environment Variable で以下を追加：

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJhbGciOi...（Legacy Service Role Key）
XAI_API_KEY=xai-xxxxx
XAI_BASE_URL=https://api.x.ai/v1
APP_NAME=Nightwork Scout API
DEBUG=False
SECRET_KEY=your-production-secret-key-change-this
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://nightwork-scout.vercel.app
```

### 5. デプロイ実行

"Create Web Service" をクリック → 自動ビルド開始

デプロイ完了後、以下のようなURLが発行されます：
```
https://nightwork-scout-api.onrender.com
```

### 6. 動作確認

```bash
curl https://nightwork-scout-api.onrender.com/health
```

期待レスポンス：
```json
{
  "status": "healthy",
  "app_name": "Nightwork Scout API",
  "debug": false
}
```

---

## フロントエンドデプロイ（Vercel）

### 1. Vercelアカウント作成

https://vercel.com/ でアカウント作成（GitHub連携推奨）

### 2. 新しいプロジェクトをインポート

1. Dashboard → "Add New" → "Project"
2. GitHubリポジトリをインポート
3. `frontend` ディレクトリを指定

### 3. プロジェクト設定

| 項目 | 設定値 |
|-----|------|
| Framework Preset | `Next.js` |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |

### 4. 環境変数設定（Vercel Dashboard）

Settings → Environment Variables で以下を追加：

```env
NEXT_PUBLIC_API_URL=https://nightwork-scout-api.onrender.com
```

### 5. デプロイ実行

"Deploy" をクリック → 自動ビルド開始

デプロイ完了後、以下のようなURLが発行されます：
```
https://nightwork-scout.vercel.app
```

### 6. カスタムドメイン設定（オプション）

Settings → Domains でカスタムドメインを追加可能

---

## 環境変数設定

### バックエンド環境変数一覧

| 変数名 | 説明 | 例 |
|-------|-----|---|
| `DATABASE_URL` | Supabase PostgreSQL接続URL | `postgresql://postgres:password@...` |
| `SUPABASE_URL` | Supabase Project URL | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Supabase Service Role Key | `eyJhbGciOi...` |
| `XAI_API_KEY` | xAI Grok API Key | `xai-xxxxx` |
| `XAI_BASE_URL` | xAI API Base URL | `https://api.x.ai/v1` |
| `SECRET_KEY` | アプリケーションシークレット | ランダム文字列（本番用） |
| `DEBUG` | デバッグモード | `False` |
| `ALLOWED_ORIGINS` | CORS許可オリジン | `https://your-app.vercel.app` |

### フロントエンド環境変数一覧

| 変数名 | 説明 | 例 |
|-------|-----|---|
| `NEXT_PUBLIC_API_URL` | バックエンドAPI URL | `https://your-api.onrender.com` |

---

## デプロイ後の確認

### 1. バックエンドAPI確認

```bash
# ヘルスチェック
curl https://nightwork-scout-api.onrender.com/health

# Swagger UI
https://nightwork-scout-api.onrender.com/docs
```

### 2. フロントエンド確認

ブラウザで以下にアクセス：
```
https://nightwork-scout.vercel.app
```

確認項目：
- [x] ダッシュボード表示
- [x] サイドバーナビゲーション
- [x] キャスト一覧が取得できる
- [x] 店舗一覧が取得できる
- [x] 新規キャスト登録でAI顔分析が動作する

### 3. CORS設定確認

ブラウザのデベロッパーツール（Console）で以下を確認：
- CORSエラーが発生していないこと
- APIリクエストが正常に完了していること

### 4. トラブルシューティング

#### CORSエラーが発生する場合

バックエンドの `ALLOWED_ORIGINS` にフロントエンドURLが含まれているか確認：
```env
ALLOWED_ORIGINS=https://nightwork-scout.vercel.app
```

#### API接続エラーが発生する場合

フロントエンドの `NEXT_PUBLIC_API_URL` が正しいか確認：
```env
NEXT_PUBLIC_API_URL=https://nightwork-scout-api.onrender.com
```

#### Renderのサービスがスリープする場合（Free Tier）

- Renderの無料プランは15分アクティビティがないとスリープします
- 初回リクエストは起動に30秒程度かかります
- 対策: Starter Tier（月$7）にアップグレード、または定期的にpingを送る

---

## カスタムドメイン設定（オプション）

### Vercel側の設定

1. Vercel Dashboard → Settings → Domains
2. ドメイン名を入力（例: `nightwork-scout.com`）
3. DNSレコードの設定値が表示される

### DNSプロバイダー側の設定

以下のレコードを追加：

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### SSL証明書

Vercelが自動でSSL証明書を発行・更新します（Let's Encrypt）

---

## 継続的デプロイ（CI/CD）

### 自動デプロイ設定

GitHubにプッシュすると自動的にデプロイされます：

- **Vercel**: `main` ブランチへのプッシュで自動デプロイ
- **Render**: `main` ブランチへのプッシュで自動デプロイ

### プレビューデプロイ

- Vercel: PR作成時に自動でプレビュー環境が作成されます
- Render: Starter Tier以上でプレビュー環境が利用可能

---

## セキュリティ推奨事項

1. ✅ 本番環境では `DEBUG=False` に設定
2. ✅ `SECRET_KEY` は強力なランダム文字列に変更
3. ✅ Supabase Service Role Keyは絶対に公開しない
4. ✅ xAI API Keyは環境変数で管理
5. ✅ CORS設定は必要最小限のオリジンのみ許可
6. ✅ HTTPSを使用（Vercel/Renderは自動対応）

---

## 監視・ログ

### Render

- Dashboard → Logs でリアルタイムログ確認
- Events でデプロイ履歴確認

### Vercel

- Dashboard → Deployments でデプロイ履歴確認
- Logs でビルドログ確認
- Analytics でアクセス解析（Pro以上）

---

## バックアップ

### Supabaseデータベース

Supabase Dashboard → Database → Backups から定期バックアップを設定

### コード

GitHubリポジトリで常にバージョン管理されています

---

**作成日**: 2026-02-12  
**最終更新**: 2026-02-12
