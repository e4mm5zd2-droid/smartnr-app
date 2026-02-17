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

// フォールバック応答生成（xAI APIが利用できない場合）
function generateFallbackResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  // キーワードベースの簡易応答
  if (message.includes('20代') || message.includes('キャスト')) {
    return '申し訳ございません。現在AI機能は一時的に利用できません。\n\n代わりに、左メニューの「キャスト」ページから手動で検索していただけます。年齢や条件で絞り込みが可能です。\n\n💡 管理者にxAI APIキーの設定を依頼してください。';
  }
  
  if (message.includes('店舗') || message.includes('祇園') || message.includes('時給')) {
    return '申し訳ございません。現在AI機能は一時的に利用できません。\n\n「店舗」ページから提携店舗の情報をご確認いただけます。エリアや時給などの条件で検索できます。\n\n💡 管理者にxAI APIキーの設定を依頼してください。';
  }
  
  if (message.includes('報酬') || message.includes('計算') || message.includes('給料')) {
    return '申し訳ございません。現在AI機能は一時的に利用できません。\n\n「紹介トラッキング」ページから報酬の詳細を確認できます。\n\n💡 管理者にxAI APIキーの設定を依頼してください。';
  }
  
  return '申し訳ございません。現在AI機能は一時的に利用できません。\n\nSmartNRの各機能は左メニューからご利用いただけます：\n• キャスト管理\n• 店舗情報\n• 紹介トラッキング\n• AI店舗マッチング\n\n💡 完全なAI機能を利用するには、管理者にxAI APIキーの設定を依頼してください。';
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

    // xAI APIキーの確認
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey || apiKey === 'your-xai-api-key-here' || apiKey.length < 20) {
      console.warn('xAI API Key not configured - using fallback response');
      const lastUserMessage = messages[messages.length - 1]?.content || '';
      const fallbackResponse = generateFallbackResponse(lastUserMessage);
      
      return NextResponse.json({
        message: {
          role: 'assistant',
          content: fallbackResponse,
        },
        fallback: true,
      });
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

    // エラー時もフォールバックを使用
    const lastUserMessage = (await request.json()).messages?.slice(-1)[0]?.content || '';
    const fallbackResponse = generateFallbackResponse(lastUserMessage);

    return NextResponse.json({
      message: {
        role: 'assistant',
        content: fallbackResponse,
      },
      fallback: true,
      error: error.message,
    });
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
