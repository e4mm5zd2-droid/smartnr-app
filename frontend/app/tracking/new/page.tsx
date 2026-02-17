'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Download, Share2 } from 'lucide-react';
import Link from 'next/link';

interface Shop {
  id: number;
  name: string;
}

function NewLinkContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialType = (searchParams.get('type') as 'recruit' | 'app_invite') || 'recruit';

  const [linkType, setLinkType] = useState<'recruit' | 'app_invite'>(initialType);
  const [shopId, setShopId] = useState<string>('');
  const [headline, setHeadline] = useState('');
  const [template, setTemplate] = useState('default');
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<{
    unique_code: string;
    url: string;
    qr_code: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const API_BASE_URL = 'https://smartnr-backend.onrender.com';
  const SCOUT_ID = 1; // TODO: Supabaseから実際のスカウトIDを取得

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stores`);
      if (res.ok) {
        const data = await res.json();
        setShops(Array.isArray(data.stores) ? data.stores : []);
      }
    } catch (err) {
      console.error('Failed to fetch shops:', err);
      setShops([]);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const body: any = {
        scout_id: SCOUT_ID,
        link_type: linkType,
        lp_template: template,
      };

      if (linkType === 'recruit') {
        if (shopId) body.shop_id = parseInt(shopId);
        if (headline) body.lp_headline = headline;
      }

      const res = await fetch(`${API_BASE_URL}/api/links/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedLink(data);
        setGenerated(true);
      }
    } catch (err) {
      console.error('Failed to generate link:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadQr = () => {
    if (!generatedLink) return;
    const link = document.createElement('a');
    link.href = generatedLink.qr_code;
    link.download = `qr-${generatedLink.unique_code}.png`;
    link.click();
  };

  const handleShareLine = () => {
    if (!generatedLink) return;
    const url = `https://line.me/R/share?text=${encodeURIComponent(generatedLink.url)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <div className="text-3xl">🔗</div>
        <h1 className="text-3xl font-bold text-white">リンク作成</h1>
      </div>

      {!generated ? (
        <>
          {/* リンクタイプ選択 */}
          <Card className="border-0 bg-zinc-900/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4">リンクタイプ</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={linkType === 'recruit' ? 'default' : 'outline'}
                onClick={() => setLinkType('recruit')}
              >
                🌙 キャスト募集
              </Button>
              <Button
                variant={linkType === 'app_invite' ? 'default' : 'outline'}
                onClick={() => setLinkType('app_invite')}
              >
                💎 アプリ紹介
              </Button>
            </div>
          </Card>

          {/* キャスト募集設定 */}
          {linkType === 'recruit' && (
            <Card className="border-0 bg-zinc-900/50 p-6">
              <h3 className="text-lg font-bold text-white mb-4">キャスト募集設定</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">紹介先店舗（オプション）</label>
                  <Select value={shopId} onValueChange={setShopId}>
                    <SelectTrigger>
                      <SelectValue placeholder="選択しない" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">選択しない</SelectItem>
                      {shops.map((shop) => (
                        <SelectItem key={shop.id} value={String(shop.id)}>
                          {shop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">LPの見出し（オプション）</label>
                  <Input
                    placeholder="例: ナイトワーク始めませんか？"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">LPテンプレート</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={template === 'default' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTemplate('default')}
                    >
                      デフォルト
                    </Button>
                    <Button
                      variant={template === 'premium' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTemplate('premium')}
                    >
                      高級感
                    </Button>
                    <Button
                      variant={template === 'casual' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTemplate('casual')}
                    >
                      カジュアル
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* アプリ紹介設定 */}
          {linkType === 'app_invite' && (
            <Card className="border-0 bg-zinc-900/50 p-6">
              <h3 className="text-lg font-bold text-white mb-4">アプリ紹介設定</h3>
              <p className="text-zinc-400 text-sm">追加設定なし。すぐに発行できます。</p>
            </Card>
          )}

          {/* 発行ボタン */}
          <Button className="w-full" size="lg" onClick={handleGenerate} disabled={loading}>
            {loading ? '発行中...' : '🔗 リンクを発行'}
          </Button>
        </>
      ) : (
        <>
          {/* 発行結果 */}
          <Card className="border-0 bg-zinc-900/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4">📋 短縮URL</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 rounded bg-zinc-800 text-white font-mono text-sm break-all">
                {generatedLink?.url}
              </div>
              <Button onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-1" />
                {copied ? '✅' : 'コピー'}
              </Button>
            </div>
          </Card>

          <Card className="border-0 bg-zinc-900/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4">📱 QRコード</h3>
            <div className="flex flex-col items-center gap-4">
              {generatedLink?.qr_code && (
                <div className="p-4 bg-white rounded-lg">
                  <img src={generatedLink.qr_code} alt="QR Code" className="w-48 h-48" />
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDownloadQr}>
                  <Download className="h-4 w-4 mr-1" />
                  画像保存
                </Button>
                <Button variant="outline" onClick={handleShareLine}>
                  <Share2 className="h-4 w-4 mr-1" />
                  LINEで送る
                </Button>
              </div>
            </div>
          </Card>

          <Card className="border-0 bg-zinc-900/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4">💡 使い方</h3>
            <ul className="space-y-2 text-zinc-300 text-sm">
              <li>・LINEにURLを貼って送信</li>
              <li>・対面でQRコードを見せる</li>
              <li>・名刺にQRを印刷</li>
            </ul>
          </Card>

          {/* アクション */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setGenerated(false)}>
              もう1つ作成
            </Button>
            <Link href="/tracking/links" className="flex-1">
              <Button className="w-full">発行済みリンク一覧へ</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function NewLinkPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><p className="text-zinc-400">読み込み中...</p></div>}>
      <NewLinkContent />
    </Suspense>
  );
}
