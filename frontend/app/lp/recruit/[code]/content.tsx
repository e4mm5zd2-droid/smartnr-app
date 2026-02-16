'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LPData {
  scout_name: string;
  shop_name?: string;
  shop_area?: string;
  headline?: string;
  is_valid: boolean;
}

export function RecruitLPContent({ code }: { code: string }) {
  const [lpData, setLpData] = useState<LPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // フォーム状態
  const [name, setName] = useState('');
  const [lineId, setLineId] = useState('');
  const [age, setAge] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // バリデーションエラー
  const [errors, setErrors] = useState<{ name?: string; lineId?: string; age?: string }>({});

  // API URL（Render本番URL - 末尾スラッシュ除去）
  const API_BASE_URL = 'https://smartnr-backend.onrender.com'.replace(/\/+$/, '');

  // LP情報取得
  useEffect(() => {
    const fetchLPData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/lp/data/${encodeURIComponent(code)}`);
        if (!response.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        const data = await response.json();
        if (!data.is_valid) {
          setError(true);
        } else {
          setLpData(data);
        }
      } catch (err) {
        console.error('LP data fetch error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLPData();
  }, [code, API_BASE_URL]);

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    const newErrors: { name?: string; lineId?: string; age?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = '名前を入力してください';
    }
    if (!lineId.trim()) {
      newErrors.lineId = 'LINE IDを入力してください';
    }
    if (!age) {
      newErrors.age = '年齢を選択してください';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/lp/submit/${encodeURIComponent(code)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          line_id: lineId.trim(),
          age: parseInt(age),
        }),
      });
      
      if (!response.ok) {
        throw new Error('送信に失敗しました');
      }
      
      setSubmitted(true);
    } catch (err) {
      console.error('Form submission error:', err);
      alert('送信に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  // ローディング画面
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #0F0F23, #1a1a3e)' }}>
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  // エラー画面（リンク無効）
  if (error || !lpData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(to bottom, #0F0F23, #1a1a3e)' }}>
        <div className="text-center space-y-4">
          <div className="text-6xl">❌</div>
          <h1 className="text-2xl font-bold text-white">このリンクは無効です</h1>
          <p className="text-slate-400">
            リンクの有効期限が切れているか、<br />
            すでに停止されています。
          </p>
        </div>
      </div>
    );
  }

  // 送信完了画面
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(to bottom, #0F0F23, #1a1a3e)' }}>
        <div className="text-center space-y-6 max-w-md">
          <div className="text-8xl">🎉</div>
          <h1 className="text-3xl font-bold text-white">
            ありがとうございます！
          </h1>
          <div className="space-y-3 text-slate-300">
            <p className="text-xl">
              担当の<span className="text-[#00C4CC] font-bold">{lpData.scout_name}</span>から<br />
              LINEでご連絡します 📱
            </p>
            <p className="text-lg">
              通常1〜2日以内に<br />
              ご連絡いたします
            </p>
          </div>
        </div>
      </div>
    );
  }

  // メインLP画面
  const headline = lpData.headline || 'ナイトワーク\n始めませんか？';

  return (
    <div className="min-h-screen pb-8" style={{ background: 'linear-gradient(to bottom, #0F0F23, #1a1a3e)' }}>
      <div className="max-w-md mx-auto px-4 pt-12 pb-8 space-y-8">
        
        {/* ヘッダー */}
        <div className="text-center space-y-4">
          <div className="text-5xl">🌙</div>
          <h1 className="text-3xl font-bold text-white whitespace-pre-line leading-tight">
            {headline}
          </h1>
        </div>

        {/* 区切り線 */}
        <div className="border-t border-slate-700"></div>

        {/* 特徴 */}
        <div className="space-y-3 text-white">
          <div className="flex items-center gap-3 text-lg">
            <span>✨</span>
            <span>月収30万円〜も可能</span>
          </div>
          <div className="flex items-center gap-3 text-lg">
            <span>✨</span>
            <span>未経験OK・丁寧にサポート</span>
          </div>
          <div className="flex items-center gap-3 text-lg">
            <span>✨</span>
            <span>日払い対応</span>
          </div>
          <div className="flex items-center gap-3 text-lg">
            <span>✨</span>
            <span>終電上がりOK</span>
          </div>
        </div>

        {/* 区切り線 */}
        <div className="border-t border-slate-700"></div>

        {/* エリア情報 */}
        {lpData.shop_area && (
          <>
            <div className="text-center space-y-2 text-white">
              <div className="text-3xl">📍</div>
              <p className="text-lg">
                {lpData.shop_area}エリアの<br />
                優良店をご紹介
              </p>
            </div>
            <div className="border-t border-slate-700"></div>
          </>
        )}

        {/* フォーム */}
        <div className="space-y-6">
          <div className="text-center space-y-2 text-white">
            <p className="text-xl font-bold">まずは話を聞くだけでOK</p>
            <p className="text-lg">お気軽にどうぞ 😊</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 名前 */}
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">名前</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: まり"
                className="w-full bg-white/10 border-slate-600 text-white placeholder:text-slate-500 h-12"
                style={{ fontSize: '16px' }}
              />
              {errors.name && (
                <p className="text-red-400 text-sm">{errors.name}</p>
              )}
            </div>

            {/* LINE ID */}
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">LINE ID</label>
              <Input
                type="text"
                value={lineId}
                onChange={(e) => setLineId(e.target.value)}
                placeholder="例: mari_kyoto"
                className="w-full bg-white/10 border-slate-600 text-white placeholder:text-slate-500 h-12"
                style={{ fontSize: '16px' }}
              />
              {errors.lineId && (
                <p className="text-red-400 text-sm">{errors.lineId}</p>
              )}
            </div>

            {/* 年齢 */}
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">年齢</label>
              <Select value={age} onValueChange={setAge}>
                <SelectTrigger className="w-full bg-white/10 border-slate-600 text-white h-12" style={{ fontSize: '16px' }}>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {Array.from({ length: 18 }, (_, i) => i + 18).map((ageValue) => (
                    <SelectItem
                      key={ageValue}
                      value={String(ageValue)}
                      className="text-white hover:bg-slate-700"
                    >
                      {ageValue}歳
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.age && (
                <p className="text-red-400 text-sm">{errors.age}</p>
              )}
            </div>

            {/* 送信ボタン */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-14 text-lg font-bold"
              style={{
                background: 'linear-gradient(135deg, #00C4CC 0%, #0088FF 100%)',
                fontSize: '18px',
              }}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  送信中...
                </span>
              ) : (
                '✨ 話を聞いてみる'
              )}
            </Button>
          </form>
        </div>

        {/* 区切り線 */}
        <div className="border-t border-slate-700"></div>

        {/* フッター */}
        <div className="space-y-4 text-center text-slate-400 text-sm">
          <p className="text-base">
            紹介者: <span className="text-[#00C4CC] font-bold">{lpData.scout_name}</span>
          </p>
          <div className="border-t border-dashed border-slate-700 pt-4"></div>
          <p className="flex items-center justify-center gap-2">
            <span>🔒</span>
            <span>個人情報は厳重に管理しています</span>
          </p>
          <p className="text-xs text-slate-500 pt-2">
            Powered by SmartNR
          </p>
        </div>
      </div>
    </div>
  );
}
