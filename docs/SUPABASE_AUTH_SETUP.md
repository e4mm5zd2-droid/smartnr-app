# Supabase Auth完全実装ガイド

## 実装済み機能 ✅

### 1. ユーザー登録（Sign Up）
- **ページ**: `/signup`
- **機能**:
  - メールアドレス・パスワードでの登録
  - パスワードバリデーション（8文字以上、大文字・数字含む）
  - パスワード確認機能
  - 利用規約への同意チェック
  - 登録完了後、確認メール送信
  - `scouts` テーブルへの自動登録（デフォルトランク: Regular）

### 2. ログイン（Sign In）
- **ページ**: `/login`
- **機能**:
  - メールアドレス・パスワード認証
  - パスワード表示/非表示切替
  - ログイン状態の保持オプション
  - エラーメッセージ表示

### 3. パスワードリセット（Reset Password）
- **ページ**: `/reset-password`
- **機能**:
  - 登録メールアドレスにリセットリンク送信
  - 成功メッセージ表示

### 4. パスワード更新（Update Password）
- **ページ**: `/update-password`
- **機能**:
  - リセットリンクからの新パスワード設定
  - パスワードバリデーション
  - 更新完了後、ログインページへリダイレクト

### 5. ログアウト（Sign Out）
- **コンポーネント**: `LogoutButton`
- **機能**:
  - サイドバーからのログアウト
  - ログイン画面へリダイレクト

---

## Supabase設定手順

### 1. メール認証の設定

#### Supabase Dashboard での設定:
1. プロジェクトダッシュボードにログイン
2. **Authentication** > **Settings** > **Email Auth** を開く
3. 以下を確認・設定:
   - ✅ Enable Email Confirmations（メール確認を有効化）
   - ✅ Enable Email Change Confirmations（メール変更確認を有効化）
   - ✅ Secure Email Change（安全なメール変更）

#### メールテンプレートのカスタマイズ:
**Authentication** > **Email Templates** で以下をカスタマイズ可能:

##### Confirm Signup（登録確認メール）
```html
<h2>SmartNR へようこそ！</h2>
<p>アカウント登録ありがとうございます。</p>
<p>以下のボタンをクリックして、メールアドレスを確認してください。</p>
<p><a href="{{ .ConfirmationURL }}">メールアドレスを確認</a></p>
```

##### Reset Password（パスワードリセットメール）
```html
<h2>パスワードリセットのご案内</h2>
<p>SmartNR のパスワードリセットリクエストを受け付けました。</p>
<p>以下のボタンをクリックして、新しいパスワードを設定してください。</p>
<p><a href="{{ .ConfirmationURL }}">パスワードをリセット</a></p>
<p>※ このリクエストに心当たりがない場合は、このメールを無視してください。</p>
```

### 2. リダイレクトURL設定

**Authentication** > **URL Configuration** で以下を設定:

```
Site URL: http://localhost:3000
Redirect URLs:
  - http://localhost:3000/login
  - http://localhost:3000/update-password
  - http://localhost:3000/
  - https://your-production-domain.com/*  (本番環境用)
```

### 3. データベーススキーマ更新

`scouts` テーブルが存在しない場合、以下のSQLを実行:

```sql
-- scouts テーブル作成
CREATE TABLE IF NOT EXISTS scouts (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  rank TEXT DEFAULT 'Regular',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 有効化
ALTER TABLE scouts ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分のデータのみ閲覧可能
CREATE POLICY "Users can view own scout data"
  ON scouts FOR SELECT
  USING (auth.uid() = id);

-- ポリシー: ユーザーは自分のデータのみ更新可能
CREATE POLICY "Users can update own scout data"
  ON scouts FOR UPDATE
  USING (auth.uid() = id);

-- ポリシー: 新規登録時に自動でデータ挿入可能
CREATE POLICY "Users can insert own scout data"
  ON scouts FOR INSERT
  WITH CHECK (auth.uid() = id);
```

---

## 環境変数設定

`.env.local` に以下を設定（既に設定済み）:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 使用方法

### ユーザー登録フロー
1. `/signup` にアクセス
2. 名前・メールアドレス・パスワードを入力
3. 利用規約に同意
4. 「アカウントを作成」をクリック
5. 確認メールが送信される
6. メール内のリンクをクリックして認証完了
7. `/login` からログイン

### パスワードリセットフロー
1. `/login` で「パスワードを忘れた?」をクリック
2. `/reset-password` で登録メールアドレスを入力
3. 「リセットリンクを送信」をクリック
4. メール内のリンクをクリック
5. `/update-password` で新しいパスワードを設定
6. 自動的に `/login` へリダイレクト

---

## セキュリティ機能

### パスワードポリシー
- 最低8文字
- 大文字を含む
- 数字を含む

### セッション管理
- Supabase Auth による自動セッション管理
- JWT トークンによる認証
- セキュアなCookie保存

### RLS (Row Level Security)
- ユーザーは自分のデータのみアクセス可能
- 他ユーザーのデータは閲覧不可

---

## トラブルシューティング

### メールが届かない場合
1. Supabase Dashboard > **Authentication** > **Settings** > **SMTP Settings** を確認
2. 開発環境では、Supabase の Inbox (ダッシュボード内) でメールを確認可能
3. 本番環境では、独自のSMTPサーバー設定を推奨

### ログインできない場合
1. メールアドレスが確認済みか確認
2. Supabase Dashboard > **Authentication** > **Users** でユーザー状態を確認
3. パスワードが正しいか確認（リセット可能）

---

## 今後の拡張予定

- [ ] Google OAuth連携
- [ ] LINE Login連携
- [ ] 2要素認証（2FA）
- [ ] セッションタイムアウト管理
- [ ] ログイン履歴の記録
