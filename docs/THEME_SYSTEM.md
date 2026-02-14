# テーマシステム実装ガイド

## 実装済み機能 ✅

### テーマ切替
- **ダークモード**（デフォルト）
- **ライトモード**
- **システム設定に従う**

### 実装場所
- **ヘッダー右上**: テーマ切替ボタン（太陽/月/モニターアイコン）
- **ドロップダウンメニュー**: 3つのテーマから選択可能

---

## 技術スタック

### ライブラリ
- **next-themes**: Next.js用のテーマ管理ライブラリ
- **localStorage**: テーマ選択の永続化

### 実装ファイル

#### 1. ThemeProvider (`components/theme-provider.tsx`)
```typescript
'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

#### 2. ThemeToggle (`components/theme-toggle.tsx`)
```typescript
'use client';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <DropdownMenu>
      {/* ライト/ダーク/システム の3つから選択 */}
    </DropdownMenu>
  );
}
```

#### 3. RootLayout (`app/layout.tsx`)
```typescript
export default function RootLayout({ children }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## テーマカラー定義 (`globals.css`)

### ライトモード
```css
:root {
  --background: oklch(1 0 0);              /* 白 */
  --foreground: oklch(0.129 0.042 264.695); /* 濃紺 */
  --card: oklch(1 0 0);
  --border: oklch(0.929 0.013 255.508);
  /* ... */
}
```

### ダークモード
```css
.dark {
  --background: oklch(0.129 0.042 264.695); /* 濃紺 */
  --foreground: oklch(0.984 0.003 247.858);  /* 白 */
  --card: oklch(0.208 0.042 265.755);
  --border: oklch(1 0 0 / 10%);
  /* ... */
}
```

### SmartNR ブランドカラー（テーマ共通）
```css
:root {
  --smartnr-blue: #00C4CC;
  --smartnr-blue-dark: #00A3AA;
  --smartnr-blue-light: #33D4DB;
}
```

---

## 使用方法

### 1. ユーザーがテーマを切り替える
1. ヘッダー右上の **テーマアイコン** をクリック
2. ドロップダウンから選択:
   - **ライトモード**: 明るい背景
   - **ダークモード**: 暗い背景（デフォルト）
   - **システム設定**: OSの設定に従う

### 2. テーマの永続化
- 選択したテーマは **localStorage** に保存
- ページをリロードしても設定が保持される

### 3. プログラムからテーマを取得・変更
```typescript
import { useTheme } from 'next-themes';

function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme('dark')}>
      ダークモードに変更
    </button>
  );
}
```

---

## コンポーネントでのテーマ対応

### Tailwindクラスでの対応
```tsx
<div className="bg-white dark:bg-slate-900">
  <p className="text-gray-900 dark:text-white">
    テーマに応じて色が変わります
  </p>
</div>
```

### CSS変数での対応（推奨）
```tsx
<div className="bg-background text-foreground">
  <p className="border-border">
    テーマに応じて自動的に色が変わります
  </p>
</div>
```

### SmartNRブランドカラー
```tsx
<button style={{ backgroundColor: '#00C4CC' }}>
  テーマに関係なく常にSmartHR Blue
</button>
```

---

## ハイドレーションエラー対策

### suppressHydrationWarning
```tsx
<html lang="ja" suppressHydrationWarning>
```
- サーバーサイドとクライアントサイドでテーマが異なる場合の警告を抑制

### マウント後のレンダリング
```tsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) {
  return <LoadingState />;
}
```

---

## テーマごとの最適化

### ダークモード
- ナイトワーク管理画面に最適
- 目に優しい
- バッテリー節約（OLED画面）

### ライトモード
- 明るい環境での視認性向上
- プリント時の最適化
- アクセシビリティ向上

### システム設定
- ユーザーのOS設定に自動追従
- 時間帯による自動切替（OSの設定次第）

---

## 今後の拡張予定

- [ ] カスタムテーマカラー設定
- [ ] 時間帯による自動切替
- [ ] ハイコントラストモード
- [ ] カラーブラインドモード
- [ ] プリントスタイルシート最適化

---

## トラブルシューティング

### テーマが反映されない
1. ブラウザのキャッシュをクリア
2. localStorage を確認: `theme` キーが存在するか
3. 開発ツールで `html` タグに `class="dark"` があるか確認

### ちらつき（フラッシュ）が発生する
- `disableTransitionOnChange` を `false` に設定（アニメーション有効化）
- ただし、パフォーマンス低下の可能性あり

### システム設定が反映されない
- ブラウザが `prefers-color-scheme` に対応しているか確認
- OS のテーマ設定を確認
