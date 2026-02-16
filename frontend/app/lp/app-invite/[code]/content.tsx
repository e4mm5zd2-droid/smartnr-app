'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LPData {
  scout_name: string;
  is_valid: boolean;
}

export function AppInviteLPContent({ code }: { code: string }) {
  const [lpData, setLpData] = useState<LPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // フォーム状態（名前・LINE IDのみ）
  const [name, setName] = useState('');
  const [lineId, setLineId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // バリデーションエラー
  const [errors, setErrors] = useState<{ name?: string; lineId?: string }>({});

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
    const newErrors: { name?: string; lineId?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = '名前を入力してください';
    }
    if (!lineId.trim()) {
      newErrors.lineId = 'LINE IDを入力してください';
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
            登録ありがとうございます！
          </h1>
          <div className="space-y-3 text-slate-300">
            <p className="text-xl">
              <span className="text-[#FF69B4] font-bold">{lpData.scout_name}</span>さんから<br />
              使い方のご案内をお送りします 💌
            </p>
            <p className="text-lg">
              指名アップ、<br />
              一緒に頑張りましょう！ ✨
            </p>
          </div>
        </div>
      </div>
    );
  }

  // メインLP画面
  return (
    <div className="min-h-screen pb-8" style={{ background: 'linear-gradient(to bottom, #0F0F23, #1a1a3e)' }}>
      <div className="max-w-md mx-auto px-4 pt-12 pb-8 space-y-8">
        
        {/* ヘッダー */}
        <div className="text-center space-y-4">
          <div className="text-6xl">💎</div>
          <h1 className="text-3xl font-bold text-white leading-tight">
            指名が増える。<br />
            売上が見える。
          </h1>
          <div className="space-y-1">
            <p className="text-xl text-[#FF69B4] font-bold">SmartNR キャスト版</p>
            <p className="text-base text-slate-400">── あなた専用の顧客管理 ──</p>
          </div>
        </div>

        {/* 区切り線 */}
        <div className="border-t border-slate-700"></div>

        {/* 特徴 */}
        <div className="space-y-4 text-white">
          <div className="flex items-start gap-3 text-base">
            <span className="text-xl flex-shrink-0">✅</span>
            <span>お客様の好み・誕生日をずっと覚えていられる</span>
          </div>
          <div className="flex items-start gap-3 text-base">
            <span className="text-xl flex-shrink-0">✅</span>
            <span>「最近来てないお客様」をお知らせ</span>
          </div>
          <div className="flex items-start gap-3 text-base">
            <span className="text-xl flex-shrink-0">✅</span>
            <span>月の売上をグラフでパッと確認</span>
          </div>
          <div className="flex items-start gap-3 text-base">
            <span className="text-xl flex-shrink-0">✅</span>
            <span>指名が増える接客のコツもAIがアドバイス</span>
          </div>
        </div>

        {/* 区切り線 */}
        <div className="border-t border-slate-700"></div>

        {/* ポイント */}
        <div className="flex justify-center gap-8 text-white text-center">
          <div className="space-y-1">
            <div className="text-3xl">📱</div>
            <p className="text-sm">スマホだけで<br />OK</p>
          </div>
          <div className="space-y-1">
            <div className="text-3xl">💰</div>
            <p className="text-sm">無料で<br />使えます</p>
          </div>
        </div>

        {/* 区切り線 */}
        <div className="border-t border-slate-700"></div>

        {/* アプリ画面イメージ（プレースホルダー） */}
        <div className="bg-gradient-to-br from-[#FF69B4]/20 to-[#00C4CC]/20 rounded-2xl p-8 text-center border border-[#FF69B4]/30">
          <p className="text-white/60 text-sm mb-2">アプリ画面イメージ</p>
          <div className="text-6xl">📊</div>
          <p className="text-white/40 text-xs mt-2">※ 実際の画面は登録後にご確認いただけます</p>
        </div>

        {/* 区切り線 */}
        <div className="border-t border-slate-700"></div>

        {/* フォーム */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 名前 */}
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">名前</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: あいり"
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
                placeholder="例: airi_ginza"
                className="w-full bg-white/10 border-slate-600 text-white placeholder:text-slate-500 h-12"
                style={{ fontSize: '16px' }}
              />
              {errors.lineId && (
                <p className="text-red-400 text-sm">{errors.lineId}</p>
              )}
            </div>

            {/* 送信ボタン（ピンクグラデーション） */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-14 text-lg font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #FF69B4 0%, #FF1493 100%)',
                fontSize: '18px',
              }}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  送信中...
                </span>
              ) : (
                '✨ 無料で始める'
              )}
            </Button>
          </form>
        </div>

        {/* 区切り線 */}
        <div className="border-t border-slate-700"></div>

        {/* フッター */}
        <div className="space-y-4 text-center text-slate-400 text-sm">
          <p className="text-base">
            紹介者: <span className="text-[#FF69B4] font-bold">{lpData.scout_name}</span>
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
