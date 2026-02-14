# AI Concierge実装ガイド

## 実装済み機能 ✅

### 1. チャットUI
- **リアルタイムチャット**: ユーザーとAIの会話インターフェース
- **メッセージ表示**: ユーザーメッセージとAI応答を区別して表示
- **タイムスタンプ**: 各メッセージの送信時刻を表示
- **ローディング表示**: AI応答生成中のインジケーター

### 2. xAI Grok API統合
- **APIルート**: `/api/ai/chat`
- **モデル**: `grok-2-1212` (最新版)
- **OpenAI互換**: OpenAI SDKを使用してxAI APIにアクセス

### 3. システムプロンプト
```
あなたは「SmartNR」という京都のナイトワーク求人管理システムのAIコンシェルジュです。

【あなたの役割】
- スカウトマンの業務をサポートする
- キャスト情報の検索・提案
- 店舗マッチングのアドバイス
- 給料計算のサポート
- 面接スケジュール管理の補助
```

### 4. サンプルクエリ
- 20代前半のキャストを探して
- 祇園エリアの高時給店舗は?
- 今月の報酬を計算して
- おすすめの店舗を教えて

---

## セットアップ手順

### 1. xAI APIキーの取得
1. [xAI Console](https://console.x.ai/) にアクセス
2. アカウントを作成/ログイン
3. API Keysセクションで新しいキーを作成
4. キーをコピー

### 2. 環境変数の設定
`.env.local` に以下を追加:

```bash
XAI_API_KEY=xai-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. 動作確認
```bash
cd frontend
npm run dev
```

ブラウザで `/concierge` にアクセスし、メッセージを送信してテスト。

---

## API仕様

### エンドポイント
```
POST /api/ai/chat
```

### リクエスト
```json
{
  "messages": [
    {
      "role": "user",
      "content": "20代前半のキャストを探して"
    }
  ]
}
```

### レスポンス
```json
{
  "message": {
    "role": "assistant",
    "content": "20代前半のキャストを検索しますね..."
  },
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 80,
    "total_tokens": 230
  }
}
```

### エラーレスポンス
```json
{
  "error": "AI応答の生成中にエラーが発生しました",
  "details": "API key is invalid"
}
```

---

## 機能詳細

### 1. 会話履歴管理
- **クライアントサイド**: `useState` で会話を保持
- **永続化（今後実装予定）**: Supabaseに会話履歴を保存

### 2. コンテキスト管理
- 過去の会話を含めてAPIリクエストを送信
- 文脈を理解した応答が可能

### 3. エラーハンドリング
- API呼び出し失敗時、エラーメッセージを表示
- ユーザーに再試行を促す

### 4. ユーザー体験
- **自動スクロール**: 新しいメッセージに自動スクロール
- **送信ボタン無効化**: 入力がない場合や送信中は無効
- **サンプルクエリ**: クリック一つで質問を送信

---

## カスタマイズ

### システムプロンプトの変更
`/app/api/ai/chat/route.ts` の `systemPrompt` を編集:

```typescript
const systemPrompt: ChatMessage = {
  role: 'system',
  content: `あなたのカスタムプロンプトをここに記述`,
};
```

### モデルの変更
```typescript
const completion = await xai.chat.completions.create({
  model: 'grok-2-1212', // 他のモデルに変更可能
  // ...
});
```

### パラメータ調整
```typescript
{
  temperature: 0.7,    // 創造性（0-1）
  max_tokens: 1000,    // 最大トークン数
  top_p: 0.9,         // サンプリング確率
  frequency_penalty: 0, // 繰り返しペナルティ
  presence_penalty: 0,  // トピック多様性
}
```

---

## 会話履歴の永続化（今後実装）

### Supabaseテーブル設計
```sql
-- AI会話履歴テーブル
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES scouts(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- メッセージテーブル
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS有効化
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- ポリシー
CREATE POLICY "Users can view own conversations"
  ON ai_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages"
  ON ai_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM ai_conversations WHERE user_id = auth.uid()
    )
  );
```

### 実装例
```typescript
// 会話履歴の保存
const saveConversation = async (messages: Message[]) => {
  const { data: conversation } = await supabase
    .from('ai_conversations')
    .insert({ title: messages[1]?.content.slice(0, 50) })
    .select()
    .single();

  await supabase
    .from('ai_messages')
    .insert(
      messages.map(msg => ({
        conversation_id: conversation.id,
        role: msg.role,
        content: msg.content,
      }))
    );
};
```

---

## ユースケース例

### 1. キャスト検索
**ユーザー**: "25歳以下で清楚系のキャストを探して"
**AI**: "25歳以下の清楚系キャストを3名ご紹介します..."

### 2. 店舗マッチング
**ユーザー**: "このキャストに合う店舗を教えて"
**AI**: "キャストの特徴から、以下の店舗がおすすめです..."

### 3. 給料計算
**ユーザー**: "今月の給料を計算して"
**AI**: "勤務時間と歩合から計算すると、今月の報酬は..."

### 4. スケジュール管理
**ユーザー**: "明日の面接予定を教えて"
**AI**: "明日は3件の面接予定があります..."

---

## トラブルシューティング

### API呼び出しが失敗する
1. **APIキー確認**: `.env.local` のキーが正しいか
2. **ネットワーク**: インターネット接続を確認
3. **クオータ**: xAIのAPIクオータを確認

### 応答が遅い
1. **max_tokens**: トークン数を減らす（1000 → 500）
2. **ストリーミング**: ストリーミング対応を実装（今後）

### 応答が期待と異なる
1. **システムプロンプト**: プロンプトを調整
2. **temperature**: 値を変更（0.7 → 0.5でより一貫性のある応答）

---

## セキュリティ

### APIキーの保護
- `.env.local` は `.gitignore` に含める
- 環境変数は**サーバーサイドのみ**で使用
- クライアントには公開しない

### レート制限
```typescript
// レート制限の実装（今後）
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});
```

### 入力検証
- メッセージの最大長を制限
- 不適切なコンテンツをフィルタリング
- SQL インジェクション対策

---

## コスト管理

### トークン使用量の最適化
1. **システムプロンプトを簡潔に**
2. **会話履歴を適切に切り詰め** (最新10メッセージのみ保持など)
3. **max_tokens を制限**

### 使用量モニタリング
```typescript
// 使用量のログ記録
console.log('Token usage:', {
  prompt: completion.usage?.prompt_tokens,
  completion: completion.usage?.completion_tokens,
  total: completion.usage?.total_tokens,
});
```

---

## 今後の拡張予定

- [ ] 会話履歴の永続化（Supabase）
- [ ] ストリーミング応答
- [ ] 音声入力対応
- [ ] 画像アップロード・分析
- [ ] ファイルアップロード対応
- [ ] マルチモーダル対応
- [ ] 会話のエクスポート（PDF/テキスト）
- [ ] AIによる自動タスク作成
- [ ] データベースへの直接クエリ機能
