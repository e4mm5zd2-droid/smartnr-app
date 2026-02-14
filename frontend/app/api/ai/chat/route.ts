import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// xAI Grok APIを使用（OpenAI互換）
const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY || '',
  baseURL: 'https://api.x.ai/v1',
});

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    // システムプロンプト
    const systemPrompt: ChatMessage = {
      role: 'system',
      content: `あなたは「SmartNR」という京都のナイトワーク求人管理システムのAIコンシェルジュです。

【あなたの役割】
- スカウトマンの業務をサポートする
- キャスト情報の検索・提案
- 店舗マッチングのアドバイス
- 給料計算のサポート
- 面接スケジュール管理の補助

【返答のルール】
1. 丁寧で親しみやすい日本語で回答
2. 具体的で実用的な情報を提供
3. 必要に応じて箇条書きや太字を使用
4. 不確実な情報は推測で答えない
5. 個人情報保護を徹底

【扱うデータ】
- キャスト情報（年齢、容姿、経験、希望条件）
- 店舗情報（エリア、時給、システム、雰囲気）
- 給料計算（勤務時間、歩合、ボーナス）
- スケジュール（面接予定、出勤予定）

丁寧にサポートしてください。`,
    };

    // xAI Grok APIを呼び出し
    const completion = await xai.chat.completions.create({
      model: 'grok-2-1212', // 最新のGrokモデル
      messages: [systemPrompt, ...messages],
      temperature: 0.7,
      max_tokens: 1000,
      stream: false,
    });

    const assistantMessage = completion.choices[0]?.message?.content || '申し訳ございません。応答の生成に失敗しました。';

    return NextResponse.json({
      message: {
        role: 'assistant',
        content: assistantMessage,
      },
      usage: completion.usage,
    });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    
    // エラーの詳細をログ
    if (error.response) {
      console.error('API Response Error:', error.response.data);
    }

    return NextResponse.json(
      {
        error: 'AI応答の生成中にエラーが発生しました',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ストリーミング対応版（オプション）
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
