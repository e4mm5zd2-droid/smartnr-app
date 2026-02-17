'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MessageSquare,
  Send,
  Sparkles,
  User,
  Bot,
  Loader2,
  ArrowLeft,
  Target,
  RefreshCw,
  TrendingUp,
  MapPin,
  DollarSign,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { calculateCommission, formatCurrency } from '@/lib/commission';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ShopRecommendation {
  shop_id: number;
  shop_name: string;
  match_score: number;
  ai_reason: string;
  hourly_wage_min?: number;
  hourly_wage_max?: number;
  sb_rate: number;
  manager_name?: string;
  manager_tip?: string;
}

interface MatchingResult {
  recommendations: ShopRecommendation[];
  ai_summary: string;
  warning?: string;
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

const LOOK_TYPES = ['清楚系', 'ギャル系', 'お姉さん系', 'かわいい系', 'クール系', '元気系'];
const EXPERIENCE_OPTIONS = ['未経験', '半年未満', '1年以上', '3年以上'];
const PRIORITY_OPTIONS = ['高時給', '働きやすさ', '知名度', '成長環境'];
const AREA_OPTIONS = ['指定なし', '祇園', '木屋町', '河原町', '先斗町', '北新地'];

export default function ConciergePage() {
  // AIチャット用state
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // AIマッチング用state
  const [age, setAge] = useState<string>('');
  const [selectedLookTypes, setSelectedLookTypes] = useState<string[]>([]);
  const [experience, setExperience] = useState<string>('未経験');
  const [priority, setPriority] = useState<string>('働きやすさ');
  const [area, setArea] = useState<string>('指定なし');
  const [personality, setPersonality] = useState<string>('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(null);
  const [progress, setProgress] = useState(0);

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

  const toggleLookType = (type: string) => {
    setSelectedLookTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleAIMatching = async () => {
    if (!age || parseInt(age) < 18 || parseInt(age) > 60) {
      alert('年齢を入力してください（18-60歳）');
      return;
    }

    setIsMatching(true);
    setProgress(0);
    setMatchingResult(null);

    // フェイクプログレスバー
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://smartnr-backend.onrender.com').replace(/\/+$/, '');
      const url = `${API_BASE_URL}/api/ai-matching`;
      console.log('AI Matching URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: parseInt(age),
          looks_tags: selectedLookTypes,
          experience,
          preferred_area: area === '指定なし' ? '' : area,
          personality,
          priority,
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Matching Response Error:', response.status, errorText);
        throw new Error(`AIマッチングに失敗しました (${response.status})`);
      }

      const data: MatchingResult = await response.json();
      setMatchingResult(data);

    } catch (error) {
      console.error('AI Matching Error:', error);
      clearInterval(progressInterval);
      alert(`AIマッチングに失敗しました。もう一度お試しください。\n\nエラー詳細: ${error instanceof Error ? error.message : '不明'}`);
    } finally {
      setIsMatching(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const resetMatchingForm = () => {
    setAge('');
    setSelectedLookTypes([]);
    setExperience('未経験');
    setPriority('働きやすさ');
    setArea('指定なし');
    setPersonality('');
    setMatchingResult(null);
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-6 h-[calc(100vh-4rem)]">
      <div className="flex h-full flex-col space-y-4">
        {/* 戻るリンク */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-zinc-400 transition-colors hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">ダッシュボードに戻る</span>
        </Link>

        {/* ヘッダー */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-3 h-12 w-12 rounded-full bg-zinc-600">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">AI Concierge</h1>
          <p className="mt-2 text-sm text-zinc-400">
            AIアシスタントがあなたをサポートします
          </p>
        </div>

        {/* タブ構成 */}
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-800/50">
            <TabsTrigger value="chat" className="data-[state=active]:bg-zinc-600 data-[state=active]:text-white">
              <MessageSquare className="h-4 w-4 mr-2" />
              AIチャット
            </TabsTrigger>
            <TabsTrigger value="matching" className="data-[state=active]:bg-zinc-600 data-[state=active]:text-white">
              <Target className="h-4 w-4 mr-2" />
              店舗マッチング
            </TabsTrigger>
          </TabsList>

          {/* タブ1: AIチャット */}
          <TabsContent value="chat" className="flex-1 flex flex-col space-y-4 mt-4">
            {/* サンプルクエリ */}
            {messages.length === 1 && (
              <div className="flex flex-wrap justify-center gap-2">
                {sampleQueries.map((query, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-xs"
                    onClick={() => handleSendMessage(query)}
                  >
                    {query}
                  </Button>
                ))}
              </div>
            )}

            {/* チャットエリア */}
            <Card className="flex-1 border-zinc-800 bg-zinc-900/50 p-4 overflow-hidden">
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
                              ? 'bg-zinc-600 text-white'
                              : 'bg-zinc-700 text-white'
                          }
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
                            ? 'bg-zinc-600 text-white'
                            : 'bg-zinc-800 text-zinc-100'
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </p>
                        <p
                          className={`mt-2 text-xs ${
                            message.role === 'user'
                              ? 'text-zinc-200'
                              : 'text-zinc-400'
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
                        <AvatarFallback className="bg-zinc-600 text-white">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="rounded-2xl bg-zinc-800 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                          <span className="text-sm text-zinc-400">入力中...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>

            {/* 入力エリア */}
            <Card className="border-zinc-800 bg-zinc-900/50 p-4">
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
                  className="flex-1 bg-zinc-800"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-zinc-600 text-white hover:bg-zinc-500 transition-all h-12 w-12"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
              <p className="mt-2 text-xs text-center text-zinc-500">
                AIによる自動応答です。重要な決定は人間が確認してください。
              </p>
            </Card>
          </TabsContent>

          {/* タブ2: 店舗マッチング */}
          <TabsContent value="matching" className="flex-1 flex flex-col space-y-4 mt-4">
            {!matchingResult ? (
              /* Step 1: 入力フォーム */
              <Card className="border-zinc-800 bg-zinc-900/50 p-4 md:p-6">
                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-white mb-2">🎯 最適な店舗を見つける</h2>
                    <p className="text-sm text-zinc-400">キャスト情報を入力してください</p>
                  </div>

                  {/* 年齢入力 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">年齢 *</label>
                    <Input
                      type="number"
                      min="18"
                      max="60"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="例: 22"
                      className="bg-zinc-800 h-12 text-lg"
                    />
                  </div>

                  {/* タイプ選択（チェックボックス） */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">タイプ（複数選択可）</label>
                    <div className="grid grid-cols-2 gap-2">
                      {LOOK_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleLookType(type)}
                          className={`h-12 rounded-lg border-2 transition-all ${
                            selectedLookTypes.includes(type)
                              ? 'border-zinc-500 bg-zinc-600/50 text-white'
                              : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 経験 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">経験</label>
                    <Select value={experience} onValueChange={setExperience}>
                      <SelectTrigger className="bg-zinc-800 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        {EXPERIENCE_OPTIONS.map(exp => (
                          <SelectItem key={exp} value={exp}>{exp}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 重視項目 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">重視項目</label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="bg-zinc-800 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        {PRIORITY_OPTIONS.map(pri => (
                          <SelectItem key={pri} value={pri}>{pri}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* エリア */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">希望エリア</label>
                    <Select value={area} onValueChange={setArea}>
                      <SelectTrigger className="bg-zinc-800 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        {AREA_OPTIONS.map(a => (
                          <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 性格メモ */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">性格・特徴（任意）</label>
                    <Input
                      value={personality}
                      onChange={(e) => setPersonality(e.target.value)}
                      placeholder="例: おっとり、明るい、人見知り..."
                      className="bg-zinc-800 h-12"
                    />
                  </div>

                  {/* AIに聞くボタン */}
                  <Button
                    onClick={handleAIMatching}
                    disabled={isMatching || !age}
                    className="w-full h-14 bg-zinc-600 hover:bg-zinc-500 text-white text-base font-bold"
                  >
                    {isMatching ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>AI分析中...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        <span>🔍 AIに聞く</span>
                      </div>
                    )}
                  </Button>

                  {/* プログレスバー */}
                  {isMatching && progress > 0 && (
                    <div className="space-y-2">
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-zinc-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-center text-zinc-400">
                        🤖 AI分析中...最適な店舗を探しています
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              /* Step 3: 結果表示 */
              <div className="flex-1 flex flex-col space-y-4">
                {/* AI総評 */}
                {matchingResult.ai_summary && (
                  <Card className="border-zinc-800 bg-zinc-900/50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-zinc-600">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-2">AI総評</h3>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                          {matchingResult.ai_summary}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* 警告メッセージ */}
                {matchingResult.warning && (
                  <div className="bg-zinc-700/50 border border-zinc-600 rounded-lg p-3">
                    <p className="text-sm text-zinc-300">⚠️ {matchingResult.warning}</p>
                  </div>
                )}

                {/* 推薦店舗リスト */}
                <ScrollArea className="flex-1">
                  <div className="space-y-4 pb-4">
                    {matchingResult.recommendations.map((shop, index) => (
                      <Card key={shop.shop_id} className="border-zinc-800 bg-zinc-900/50 p-4">
                        <div className="space-y-3">
                          {/* ヘッダー */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-zinc-600 text-white px-2 py-1">
                                #{index + 1}
                              </Badge>
                              <h3 className="font-bold text-white text-lg">{shop.shop_name}</h3>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-zinc-400 fill-zinc-400" />
                              <span className="font-bold text-white">{shop.match_score}</span>
                            </div>
                          </div>

                          {/* マッチ度バー */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-zinc-400">マッチング度</span>
                              <span className="text-xs font-bold text-zinc-300">
                                {shop.match_score}%
                              </span>
                            </div>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-zinc-500 transition-all duration-500"
                                style={{ width: `${shop.match_score}%` }}
                              />
                            </div>
                          </div>

                          {/* 店舗情報 */}
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-zinc-300">
                              <DollarSign className="h-4 w-4 text-zinc-400" />
                              <span>
                                {shop.hourly_wage_min && shop.hourly_wage_max
                                  ? `¥${shop.hourly_wage_min.toLocaleString()}-${shop.hourly_wage_max.toLocaleString()}`
                                  : '要相談'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-300">
                              <TrendingUp className="h-4 w-4 text-zinc-400" />
                              <span>バック {shop.sb_rate}%</span>
                            </div>
                          </div>

                          {/* AIコメント */}
                          <div className="bg-zinc-800/50 rounded-lg p-3">
                            <p className="text-sm text-zinc-300 leading-relaxed">
                              💡 {shop.ai_reason}
                            </p>
                          </div>

                          {/* 店長情報 */}
                          {(shop.manager_name || shop.manager_tip) && (
                            <div className="border-t border-zinc-800 pt-3 space-y-2">
                              {shop.manager_name && (
                                <p className="text-xs text-zinc-400">
                                  👤 店長: <span className="text-zinc-300">{shop.manager_name}</span>
                                </p>
                              )}
                              {shop.manager_tip && (
                                <div className="bg-zinc-700/50 border border-zinc-600 rounded-lg p-2">
                                  <p className="text-xs text-zinc-300">
                                    💬 {shop.manager_tip}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}

                    {matchingResult.recommendations.length === 0 && (
                      <Card className="border-zinc-800 bg-zinc-900/50 p-8">
                        <div className="text-center text-zinc-400">
                          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>条件に合う店舗が見つかりませんでした。</p>
                          <p className="text-sm mt-2">条件を変えて再検索してください。</p>
                        </div>
                      </Card>
                    )}
                  </div>
                </ScrollArea>

                {/* 再検索ボタン */}
                <Button
                  onClick={resetMatchingForm}
                  variant="outline"
                  className="w-full h-12 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  条件を変えて再検索
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
