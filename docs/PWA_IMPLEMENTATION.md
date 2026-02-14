# PWA（Progressive Web App）実装ガイド

## 実装済み機能 ✅

### 1. PWA基本機能
- **マニフェストファイル** (`/public/manifest.json`)
- **Service Worker** (`/public/sw.js`)
- **アプリアイコン** (192x192, 512x512)
- **オフラインページ** (`/public/offline.html`)
- **インストールプロンプト**

### 2. プッシュ通知
- **通知権限リクエスト**
- **プッシュサブスクリプション管理**
- **通知表示**
- **通知クリック時の動作**

### 3. キャッシュ戦略
- **ネットワーク優先、フォールバックでキャッシュ**
- **アプリシェルのキャッシュ**
- **動的キャッシュ**

---

## インストール方法

### iPhone (Safari)
1. Safariで SmartNR を開く
2. 画面下部の **共有ボタン** をタップ
3. **ホーム画面に追加** を選択
4. **追加** をタップ

### Android (Chrome)
1. Chromeで SmartNR を開く
2. 画面下部に表示される **インストールバナー** をタップ
3. または、メニュー (⋮) > **アプリをインストール**

### デスクトップ (Chrome/Edge)
1. アドレスバー右側の **インストールアイコン** をクリック
2. または、設定 > **SmartNRをインストール**

---

## ファイル構成

### 1. manifest.json
```json
{
  "name": "SmartNR - ナイトワーク求人管理システム",
  "short_name": "SmartNR",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0F172A",
  "theme_color": "#00C4CC",
  "icons": [...]
}
```

**主要設定:**
- `display: "standalone"`: ブラウザUIを非表示
- `orientation: "portrait"`: 縦向き固定
- `shortcuts`: ホーム画面からの直接アクセス

### 2. Service Worker (sw.js)
```javascript
// キャッシュ戦略
self.addEventListener('fetch', (event) => {
  // ネットワーク優先、フォールバックでキャッシュ
});

// プッシュ通知
self.addEventListener('push', (event) => {
  // 通知を表示
});
```

**機能:**
- オフラインサポート
- プッシュ通知受信
- バックグラウンド同期
- キャッシュ管理

### 3. PWARegister コンポーネント
```typescript
// Service Worker の登録
navigator.serviceWorker.register('/sw.js');
```

### 4. PWAInstaller コンポーネント
```typescript
// インストールプロンプトの表示
window.addEventListener('beforeinstallprompt', (e) => {
  // インストールバナーを表示
});
```

### 5. PushNotificationButton コンポーネント
```typescript
// プッシュ通知の有効化
Notification.requestPermission();
registration.pushManager.subscribe({...});
```

---

## プッシュ通知設定

### 1. VAPID鍵の生成
```bash
npm install web-push -g
web-push generate-vapid-keys
```

### 2. 環境変数設定 (`.env.local`)
```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_EMAIL=mailto:your-email@example.com
```

### 3. サブスクリプション管理
- **登録**: `/api/push/subscribe`
- **解除**: `/api/push/unsubscribe`
- **送信**: `/api/push/send`

### 4. 通知の送信例
```typescript
// サーバーサイド (Next.js API Route)
import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

await webpush.sendNotification(subscription, JSON.stringify({
  title: '新規キャスト登録',
  body: 'あやかさんが登録されました',
  icon: '/icon-192x192.png',
  data: { url: '/casts/1' }
}));
```

---

## オフライン対応

### キャッシュ対象
- **アプリシェル**: HTML, CSS, JS
- **画像**: アイコン、ロゴ
- **API レスポンス**: 動的にキャッシュ

### オフライン時の動作
1. **ナビゲーション**: オフラインページを表示
2. **API リクエスト**: キャッシュから返す
3. **POST リクエスト**: IndexedDBに保存、オンライン復帰時に送信

---

## ショートカット

ホーム画面アイコンを長押しすると、以下のショートカットが表示されます：

1. **ダッシュボード** → `/`
2. **キャスト一覧** → `/casts`
3. **新規登録** → `/casts/new`
4. **給料申請** → `/salary`

---

## パフォーマンス最適化

### Lighthouse スコア目標
- **Performance**: 90+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100
- **PWA**: ✓ Installable

### 最適化項目
✅ Service Worker登録
✅ HTTPSで配信
✅ manifest.json設定
✅ レスポンシブデザイン
✅ オフライン対応
✅ アイコン設定 (192x192, 512x512)

---

## トラブルシューティング

### Service Worker が登録されない
1. **HTTPS必須**: localhost以外ではHTTPS必須
2. **ファイルパス**: `/sw.js` が正しいか確認
3. **ブラウザキャッシュ**: クリアして再読み込み

### インストールバナーが表示されない
1. **manifestリンク**: HTMLに `<link rel="manifest">` があるか
2. **アイコン**: 192x192 と 512x512 の両方が必要
3. **HTTPS**: HTTPSで配信されているか
4. **エンゲージメント**: ユーザーが30秒以上滞在している必要がある

### プッシュ通知が届かない
1. **権限**: `Notification.permission === 'granted'` か確認
2. **サブスクリプション**: 有効なサブスクリプションが存在するか
3. **VAPID鍵**: 正しく設定されているか
4. **ブラウザ対応**: Safari (iOS) は Push API 非対応

---

## ブラウザ対応状況

| 機能 | Chrome | Safari | Firefox | Edge |
|------|--------|--------|---------|------|
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Add to Home Screen | ✅ | ✅ | ✅ | ✅ |
| Push API | ✅ | ❌ | ✅ | ✅ |
| Background Sync | ✅ | ❌ | ❌ | ✅ |
| Web Share API | ✅ | ✅ | ❌ | ✅ |

**注意**: Safari (iOS) は Push API に対応していません（2024年時点）

---

## 今後の拡張予定

- [ ] バックグラウンド同期の完全実装
- [ ] 定期的バックグラウンド同期
- [ ] Web Share API 統合
- [ ] バッジ API（通知件数表示）
- [ ] ウィジェット対応
- [ ] ショートカット追加機能
- [ ] オフライン時の編集・同期

---

## セキュリティ

### HTTPS必須
PWAはHTTPS環境でのみ動作します（localhostを除く）

### Content Security Policy (CSP)
Service Worker のセキュリティを強化

### Push通知の認証
VAPID鍵による認証で、なりすましを防止

---

## 本番環境デプロイ時のチェックリスト

- [ ] HTTPS証明書の設定
- [ ] manifest.json の `start_url` を本番URLに変更
- [ ] Service Worker のキャッシュバージョンを更新
- [ ] VAPID鍵の設定（環境変数）
- [ ] CSP ヘッダーの設定
- [ ] Lighthouseでスコア確認
- [ ] 各デバイスでインストールテスト
- [ ] プッシュ通知のテスト
- [ ] オフライン動作のテスト
