# 多言語対応ガイド

## サポート言語 🌏

- 🇯🇵 **日本語（Japanese）**: デフォルト言語
- 🇺🇸 **英語（English）**: グローバル対応
- 🇰🇷 **韓国語（Korean）**: 韓国人キャスト向け
- 🇨🇳 **中国語（Chinese）**: 中国人キャスト向け

---

## 実装概要

### 今回の実装範囲
現在のアプリは**日本語のみ**で完全に動作します。

多言語対応を実装する場合、以下の手順で拡張可能です：

### 1. 翻訳ライブラリの導入
```bash
npm install next-intl
```

### 2. 翻訳ファイルの作成
```
messages/
  ├── ja.json  # 日本語
  ├── en.json  # 英語
  ├── ko.json  # 韓国語
  └── zh.json  # 中国語
```

### 3. 言語切替UIの実装
```typescript
// ヘッダーに言語選択ドロップダウン
<LanguageSelector />
```

---

## 翻訳ファイル例

### ja.json（日本語）
```json
{
  "common": {
    "dashboard": "ダッシュボード",
    "casts": "キャスト一覧",
    "newRegistration": "新規登録",
    "stores": "店舗管理",
    "salary": "給料申請",
    "schedule": "面接スケジュール",
    "aiConcierge": "AI Concierge"
  },
  "auth": {
    "login": "ログイン",
    "logout": "ログアウト",
    "signup": "新規登録",
    "email": "メールアドレス",
    "password": "パスワード"
  }
}
```

### en.json（英語）
```json
{
  "common": {
    "dashboard": "Dashboard",
    "casts": "Cast List",
    "newRegistration": "New Registration",
    "stores": "Store Management",
    "salary": "Salary Request",
    "schedule": "Interview Schedule",
    "aiConcierge": "AI Concierge"
  },
  "auth": {
    "login": "Login",
    "logout": "Logout",
    "signup": "Sign Up",
    "email": "Email",
    "password": "Password"
  }
}
```

### ko.json（韓国語）
```json
{
  "common": {
    "dashboard": "대시보드",
    "casts": "캐스트 목록",
    "newRegistration": "신규 등록",
    "stores": "매장 관리",
    "salary": "급여 신청",
    "schedule": "면접 일정",
    "aiConcierge": "AI 컨시어지"
  },
  "auth": {
    "login": "로그인",
    "logout": "로그아웃",
    "signup": "회원가입",
    "email": "이메일",
    "password": "비밀번호"
  }
}
```

### zh.json（中国語・簡体字）
```json
{
  "common": {
    "dashboard": "仪表板",
    "casts": "演员列表",
    "newRegistration": "新注册",
    "stores": "商店管理",
    "salary": "工资申请",
    "schedule": "面试日程",
    "aiConcierge": "AI 礼宾"
  },
  "auth": {
    "login": "登录",
    "logout": "登出",
    "signup": "注册",
    "email": "电子邮件",
    "password": "密码"
  }
}
```

---

## 実装手順（参考）

### ステップ1: next-intlの設定
```typescript
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return [{ locale: 'ja' }, { locale: 'en' }, { locale: 'ko' }, { locale: 'zh' }];
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### ステップ2: 翻訳の使用
```typescript
import { useTranslations } from 'next-intl';

export function Header() {
  const t = useTranslations('common');

  return (
    <nav>
      <Link href="/dashboard">{t('dashboard')}</Link>
      <Link href="/casts">{t('casts')}</Link>
    </nav>
  );
}
```

### ステップ3: 言語切替コンポーネント
```typescript
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Select } from '@/components/ui/select';

const languages = [
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

export function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (locale: string) => {
    const newPath = pathname.replace(/^\/[a-z]{2}/, `/${locale}`);
    router.push(newPath);
  };

  return (
    <Select onValueChange={handleChange}>
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </Select>
  );
}
```

---

## 翻訳すべき主要テキスト

### 1. ナビゲーション
- ダッシュボード
- キャスト一覧
- 新規登録
- 店舗管理
- 面接スケジュール
- 給料申請
- AI Concierge

### 2. 認証
- ログイン
- ログアウト
- 新規登録
- パスワードリセット

### 3. フォーム
- 名前
- メールアドレス
- パスワード
- 電話番号
- 住所
- 備考

### 4. ボタン・アクション
- 保存
- キャンセル
- 削除
- 編集
- 検索
- フィルター
- エクスポート

### 5. ステータス
- 活動中
- 休止中
- 審査中
- 承認済み
- 却下

---

## 言語ごとの文化的配慮

### 日本語
- 敬語の使用
- 「さん」などの敬称
- 縦書き対応（オプション）

### 英語
- カジュアルな表現
- シンプルで分かりやすい単語
- 時制の正確な使い分け

### 韓国語
- 存在尊称語の使用
- 漢字の併記（オプション）
- 長音の正確な表記

### 中国語
- 簡体字使用（台湾向けは繁体字）
- 敬語の適切な使用
- 数字の文化的意味を考慮

---

## データベース対応

### 多言語カラムの追加
```sql
ALTER TABLE casts
ADD COLUMN name_en TEXT,
ADD COLUMN name_ko TEXT,
ADD COLUMN name_zh TEXT;

ALTER TABLE shops
ADD COLUMN description_en TEXT,
ADD COLUMN description_ko TEXT,
ADD COLUMN description_zh TEXT;
```

### JSONBでの多言語データ保存
```sql
ALTER TABLE casts
ADD COLUMN name_i18n JSONB DEFAULT '{}'::jsonb;

-- 例
{
  "ja": "あやか",
  "en": "Ayaka",
  "ko": "아야카",
  "zh": "绫香"
}
```

---

## SEO対応

### hreflang タグ
```html
<link rel="alternate" hreflang="ja" href="https://smartnr.com/ja/casts" />
<link rel="alternate" hreflang="en" href="https://smartnr.com/en/casts" />
<link rel="alternate" hreflang="ko" href="https://smartnr.com/ko/casts" />
<link rel="alternate" hreflang="zh" href="https://smartnr.com/zh/casts" />
<link rel="alternate" hreflang="x-default" href="https://smartnr.com/ja/casts" />
```

---

## 今後の実装計画

### フェーズ1: 基本対応
- [ ] next-intl導入
- [ ] 翻訳ファイル作成（主要4言語）
- [ ] 言語切替UI実装

### フェーズ2: コンテンツ翻訳
- [ ] 全ページの翻訳
- [ ] エラーメッセージの翻訳
- [ ] 通知メッセージの翻訳

### フェーズ3: 高度な対応
- [ ] 言語ごとの日付フォーマット
- [ ] 通貨表示の対応
- [ ] RTL（右から左）言語対応（アラビア語等）

---

## ベストプラクティス

### 1. 翻訳キーの命名規則
```typescript
// Good
t('auth.login.button')
t('casts.list.title')

// Bad
t('login')
t('title1')
```

### 2. プレースホルダーの使用
```json
{
  "welcome": "ようこそ、{name}さん",
  "itemCount": "{count}件のアイテム"
}
```

```typescript
t('welcome', { name: 'あやか' })
t('itemCount', { count: 10 })
```

### 3. 複数形の対応
```json
{
  "castCount": {
    "zero": "キャストなし",
    "one": "1人のキャスト",
    "other": "{count}人のキャスト"
  }
}
```

---

## まとめ

現在のアプリは**日本語専用**として完全に動作しますが、
上記の手順に従うことで、いつでも多言語対応に拡張可能です。

**実装の優先順位:**
1. **日本語の完成度向上** → 現在完了
2. **英語対応** → グローバル展開時
3. **韓国語・中国語** → 外国人キャスト増加時
