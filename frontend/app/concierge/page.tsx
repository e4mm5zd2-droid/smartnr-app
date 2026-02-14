'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquare,
  Send,
  Sparkles,
  User,
  Bot,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'こんにちは!👋 SmartNR AI Conciergeです。キャスト情報の検索、店舗のおすすめ、給料計算など、何でもお手伝いします。どのようなご用件でしょうか?',
    timestamp: new Date(),
  },
];

const sampleQueries = [
  '20代前半のキャストを探して',
  '祇園エリアの高時給店舗は?',
  '今月の報酬を計算して',
  'おすすめの店舗を教えて',
];

export default function ConciergePage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // xAI Grok API呼び出し
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('AI応答に失敗しました');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      
      // エラーメッセージを表示
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '申し訳ございません。AI応答の生成中にエラーが発生しました。しばらくしてから再度お試しください。',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="container mx-auto max-w-4xl p-6 h-[calc(100vh-4rem)]">
      <div className="flex h-full flex-col space-y-4">
        {/* 戻るリンク */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">ダッシュボードに戻る</span>
        </Link>

        {/* ヘッダー */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-3 h-12 w-12 rounded-full" style={{ background: 'linear-gradient(135deg, #00C4CC 0%, #33D4DB 100%)' }}>
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold">AI Concierge</h1>
          <p className="mt-2 text-sm text-slate-400">
            AIアシスタントがあなたをサポートします
          </p>
        </div>

        {/* サンプルクエリ */}
        {messages.length === 1 && (
          <div className="flex flex-wrap justify-center gap-2">
            {sampleQueries.map((query, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="border-slate-700 text-xs"
                onClick={() => handleSendMessage(query)}
              >
                {query}
              </Button>
            ))}
          </div>
        )}

        {/* チャットエリア */}
        <Card className="flex-1 border-slate-800 bg-slate-900/50 p-4 overflow-hidden">
          <ScrollArea className="h-full pr-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback
                      className={
                        message.role === 'assistant'
                          ? 'text-white'
                          : 'bg-slate-700'
                      }
                      style={message.role === 'assistant' ? { background: 'linear-gradient(135deg, #00C4CC 0%, #33D4DB 100%)' } : undefined}
                    >
                      {message.role === 'assistant' ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'text-white'
                        : 'bg-slate-800 text-slate-100'
                    }`}
                    style={message.role === 'user' ? { background: 'linear-gradient(135deg, #00C4CC 0%, #33D4DB 100%)' } : undefined}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
                    <p
                      className={`mt-2 text-xs ${
                        message.role === 'user'
                          ? 'text-purple-100'
                          : 'text-slate-400'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="text-white" style={{ background: 'linear-gradient(135deg, #00C4CC 0%, #33D4DB 100%)' }}>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl bg-slate-800 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#00C4CC' }} />
                      <span className="text-sm text-slate-400">入力中...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* 入力エリア */}
        <Card className="border-slate-800 bg-slate-900/50 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="メッセージを入力..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-slate-800"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #00C4CC 0%, #33D4DB 100%)' }}
              onMouseEnter={(e) => !isLoading && !input.trim() && (e.currentTarget.style.background = 'linear-gradient(135deg, #00A3AA 0%, #00C4CC 100%)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #00C4CC 0%, #33D4DB 100%)')}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="mt-2 text-xs text-center text-slate-500">
            AIによる自動応答です。重要な決定は人間が確認してください。
          </p>
        </Card>
      </div>
    </div>
  );
}
