'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LinkCard } from '@/components/tracking/LinkCard';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';

interface LinkData {
  id: number;
  unique_code: string;
  link_type: 'recruit' | 'app_invite';
  shop_name: string | null;
  clicks: number;
  submissions: number;
  cvr: number;
  created_at: string;
  is_active: boolean;
  force_disabled: boolean;
  qr_code: string;
}

interface LinksResponse {
  links: LinkData[];
  total: number;
}

export default function MyLinksPage() {
  const [data, setData] = useState<LinksResponse | null>(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [qrModal, setQrModal] = useState<{ open: boolean; linkData: LinkData | null }>({
    open: false,
    linkData: null,
  });

  const API_BASE_URL = 'https://smartnr-backend.onrender.com';
  const SCOUT_ID = 1; // TODO: Supabaseから実際のスカウトIDを取得

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({ scout_id: String(SCOUT_ID) });
      if (filter !== 'all') params.append('link_type', filter);

      const res = await fetch(`${API_BASE_URL}/api/links/my-links?${params.toString()}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch links:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (linkId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/links/${linkId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scout_id: SCOUT_ID }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to toggle link:', err);
    }
  };

  const handleShowQr = (linkId: number) => {
    const link = data?.links.find((l) => l.id === linkId);
    if (link) {
      setQrModal({ open: true, linkData: link });
    }
  };

  const handleDownloadQr = () => {
    if (!qrModal.linkData) return;
    const link = document.createElement('a');
    link.href = qrModal.linkData.qr_code;
    link.download = `qr-${qrModal.linkData.unique_code}.png`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-zinc-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/tracking">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="text-3xl">📋</div>
          <h1 className="text-3xl font-bold text-white">発行済みリンク</h1>
        </div>
        <Link href="/tracking/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            新規作成
          </Button>
        </Link>
      </div>

      {/* フィルター */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          全て
        </Button>
        <Button
          size="sm"
          variant={filter === 'recruit' ? 'default' : 'outline'}
          onClick={() => setFilter('recruit')}
        >
          🌙 募集
        </Button>
        <Button
          size="sm"
          variant={filter === 'app_invite' ? 'default' : 'outline'}
          onClick={() => setFilter('app_invite')}
        >
          💎 アプリ
        </Button>
      </div>

      {/* リンク一覧 */}
      <div className="space-y-3">
        {data?.links && data.links.map((link) => (
          <LinkCard
            key={link.id}
            id={link.id}
            uniqueCode={link.unique_code}
            linkType={link.link_type}
            shopName={link.shop_name || undefined}
            clicks={link.clicks}
            submissions={link.submissions}
            cvr={link.cvr}
            createdAt={link.created_at}
            isActive={link.is_active}
            forceDisabled={link.force_disabled}
            onToggle={handleToggle}
            onShowQr={handleShowQr}
          />
        ))}
      </div>

      {(!data?.links || data.links.length === 0) && (
        <Card className="border-0 bg-zinc-900/50 p-12 text-center">
          <p className="text-zinc-400 mb-4">まだリンクがありません</p>
          <Link href="/tracking/new">
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              最初のリンクを作成
            </Button>
          </Link>
        </Card>
      )}

      {/* QRコードモーダル */}
      <Dialog open={qrModal.open} onOpenChange={(open) => setQrModal({ ...qrModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QRコード</DialogTitle>
          </DialogHeader>
          {qrModal.linkData && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg">
                  <img src={qrModal.linkData.qr_code} alt="QR Code" className="w-64 h-64" />
                </div>
              </div>
              <p className="text-center text-sm text-zinc-400 font-mono">
                {qrModal.linkData.unique_code}
              </p>
              <Button className="w-full" onClick={handleDownloadQr}>
                📥 画像をダウンロード
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
