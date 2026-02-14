# Google Maps API統合ガイド

## 実装済み機能 ✅

### 1. 地図表示コンポーネント
- **カスタムマーカー**: SmartHR Blue (#00C4CC) のピン
- **ダークモード対応**: 夜のイメージに合うダークテーマ
- **レスポンシブ**: モバイル対応

### 2. 統合箇所
- **店舗詳細ページ**: 各店舗の位置を地図で表示
- **面接スケジュール**: 面接場所を地図で確認（今後実装）

---

## セットアップ手順

### 1. Google Cloud Platformでプロジェクト作成
1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成
3. プロジェクト名: `smartnr` (任意)

### 2. Maps JavaScript APIを有効化
1. 「APIとサービス」> 「ライブラリ」に移動
2. 「Maps JavaScript API」を検索
3. 「有効にする」をクリック

### 3. APIキーの作成
1. 「認証情報」タブに移動
2. 「認証情報を作成」> 「APIキー」を選択
3. APIキーをコピー

### 4. APIキーの制限設定（推奨）
**アプリケーションの制限:**
- HTTPリファラーを選択
- 許可するリファラーを追加:
  - `http://localhost:3000/*` (開発環境)
  - `https://your-domain.com/*` (本番環境)

**APIの制限:**
- 「キーを制限」を選択
- 以下を許可:
  - Maps JavaScript API
  - Places API
  - Geocoding API

### 5. 環境変数の設定
`.env.local` に追加:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 使用方法

### 基本的な地図表示
```typescript
import { GoogleMap } from '@/components/google-map';

<GoogleMap
  lat={35.0116} // 緯度
  lng={135.7681} // 経度
  zoom={15}
  markerTitle="Club LION"
  className="h-64 w-full rounded-lg"
/>
```

### 京都の主要エリア座標
| エリア | 緯度 | 経度 |
|--------|------|------|
| 祇園 | 35.0037 | 135.7749 |
| 木屋町 | 35.0037 | 135.7681 |
| 先斗町 | 35.0037 | 135.7710 |
| 河原町 | 35.0030 | 135.7681 |

---

## カスタマイズ

### ダークモードスタイル
現在のテーマ：
- 背景: ダークグレー (#242f3e)
- 水域: ダークブルー (#17263c)
- 道路: グレー (#38414e)
- マーカー: SmartHR Blue (#00C4CC)

### マーカーアイコンの変更
```typescript
icon: {
  url: '/custom-marker.png',
  scaledSize: new google.maps.Size(40, 40),
}
```

---

## 拡張機能（今後実装）

### 1. ルート検索
現在地から店舗までのルートを表示

```typescript
const directionsService = new google.maps.DirectionsService();
const directionsRenderer = new google.maps.DirectionsRenderer();

directionsService.route(
  {
    origin: { lat: 35.0116, lng: 135.7681 }, // 現在地
    destination: { lat: 35.0037, lng: 135.7749 }, // 店舗
    travelMode: google.maps.TravelMode.TRANSIT, // 公共交通機関
  },
  (result, status) => {
    if (status === 'OK') {
      directionsRenderer.setDirections(result);
    }
  }
);
```

### 2. 複数店舗表示
```typescript
shops.forEach((shop) => {
  new google.maps.Marker({
    position: { lat: shop.lat, lng: shop.lng },
    map,
    title: shop.name,
  });
});
```

### 3. 情報ウィンドウ
```typescript
const infoWindow = new google.maps.InfoWindow({
  content: `
    <div>
      <h3>${shop.name}</h3>
      <p>${shop.address}</p>
      <p>時給: ¥${shop.hourly_wage}</p>
    </div>
  `,
});

marker.addListener('click', () => {
  infoWindow.open(map, marker);
});
```

### 4. 近隣店舗検索
```typescript
const service = new google.maps.places.PlacesService(map);

service.nearbySearch(
  {
    location: { lat, lng },
    radius: 1000, // 1km以内
    type: 'restaurant', // 飲食店
  },
  (results, status) => {
    // 結果を処理
  }
);
```

---

## コスト管理

### 料金プラン
- **Maps JavaScript API**: $7 per 1,000 loads
- **Places API**: $17 per 1,000 requests
- **Geocoding API**: $5 per 1,000 requests

### 無料枠
- **$200/月**: 毎月の無料クレジット
- 約28,500回の地図読み込みが可能

### コスト削減策
1. **キャッシュ活用**: 同じ場所の地図を再利用
2. **遅延読み込み**: 必要な時のみ読み込み
3. **静的地図**: 変更不要な場所は静的画像を使用

```typescript
// 静的地図URL生成
const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x400&markers=color:blue%7C${lat},${lng}&key=${apiKey}`;
```

---

## トラブルシューティング

### 地図が表示されない
1. **APIキー確認**: `.env.local` のキーが正しいか
2. **API有効化**: Maps JavaScript APIが有効か
3. **ブラウザコンソール**: エラーメッセージを確認

### "For development purposes only" 表示
- APIキーの制限が厳しすぎる
- HTTPリファラーを確認

### 地図がグレーアウト
- 請求先アカウントが設定されていない
- Google Cloud Consoleで請求を有効化

---

## セキュリティ

### APIキーの保護
✅ **DO**:
- 環境変数で管理
- HTTPリファラーで制限
- 使用するAPIのみ許可

❌ **DON'T**:
- コードに直接記述
- Gitにコミット
- 公開リポジトリで共有

### 不正使用の監視
1. Google Cloud Consoleで使用状況を確認
2. 異常なリクエストがないかチェック
3. 予算アラートを設定

---

## ベストプラクティス

### パフォーマンス最適化
```typescript
// 遅延読み込み
const loadMap = dynamic(() => import('@/components/google-map'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});
```

### ユーザー体験
- ローディング表示
- エラーハンドリング
- フォールバック（地図が読み込めない場合の住所表示）

---

## 今後の拡張予定

- [ ] ルート検索機能
- [ ] 複数店舗マーカー
- [ ] 情報ウィンドウ
- [ ] 近隣店舗検索
- [ ] ストリートビュー統合
- [ ] 現在地取得
- [ ] お気に入り店舗保存
- [ ] 店舗間の距離計算
