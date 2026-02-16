'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { ConversionCard } from '@/components/tracking/ConversionCard';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

interface Conversion {
  id: number;
  applicant_name: string;
  applicant_age: number | null;
  link_type: 'recruit' | 'app_invite';
  shop_name: string | null;
  status: string;
  created_at: string;
  sb_amount: number;
  sb_paid: boolean;
  memo: string | null;
  timeline: Array<{ status: string; timestamp: string }>;
}

interface ConversionsResponse {
  conversions: Conversion[];
  total: number;
  page: number;
  total_pages: number;
}

function MyConversionsContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type');

  const [data, setData] = useState<ConversionsResponse | null>(null);
  const [linkType, setLinkType] = useState(initialType || 'all');
  const [status, setStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // モーダル
  const [statusUpdateModal, setStatusUpdateModal] = useState<{
    open: boolean;
    conversionId: number | null;
    currentStatus: string;
    newStatus: string;
    memo: string;
    estimatedRevenue: number;
  }>({
    open: false,
    conversionId: null,
    currentStatus: '',
    newStatus: '',
    memo: '',
    estimatedRevenue: 500000,
  });

  const [memoModal, setMemoModal] = useState<{
    open: boolean;
    conversionId: number | null;
    memo: string;
  }>({
    open: false,
    conversionId: null,
    memo: '',
  });

  const API_BASE_URL = 'https://smartnr-backend.onrender.com';
  const SCOUT_ID = 1; // TODO: Supabaseから実際のスカウトIDを取得

  useEffect(() => {
    fetchData();
  }, [linkType, status, sortBy, page]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({
        scout_id: String(SCOUT_ID),
        page: String(page),
        limit: '20',
        sort_by: sortBy,
      });

      if (linkType !== 'all') params.append('link_type', linkType);
      if (status !== 'all') params.append('status', status);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`${API_BASE_URL}/api/links/conversions?${params.toString()}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch conversions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdateModal.conversionId) return;

    const body: any = {
      scout_id: SCOUT_ID,
      new_status: statusUpdateModal.newStatus,
      memo: statusUpdateModal.memo || null,
    };

    if (statusUpdateModal.newStatus === 'hired') {
      body.estimated_revenue = statusUpdateModal.estimatedRevenue;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/links/conversions/${statusUpdateModal.conversionId}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      if (res.ok) {
        fetchData();
        setStatusUpdateModal({
          open: false,
          conversionId: null,
          currentStatus: '',
          newStatus: '',
          memo: '',
          estimatedRevenue: 500000,
        });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleMemoUpdate = async () => {
    if (!memoModal.conversionId) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/links/conversions/${memoModal.conversionId}/memo`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scout_id: SCOUT_ID,
            memo: memoModal.memo,
          }),
        }
      );

      if (res.ok) {
        fetchData();
        setMemoModal({ open: false, conversionId: null, memo: '' });
      }
    } catch (err) {
      console.error('Failed to update memo:', err);
    }
  };

  const getNextStatus = (current: string): string | null => {
    const flow: Record<string, string> = {
      submitted: 'contacted',
      contacted: 'interviewed',
      interviewed: 'trial',
      trial: 'hired',
      hired: 'active',
    };
    return flow[current] || null;
  };

  const calculateSB = (revenue: number) => {
    const sb = Math.floor(revenue * 0.25);
    const scoutShare = Math.floor(sb * 0.7);
    return { sb, scoutShare };
  };

  const { sb, scoutShare } = calculateSB(statusUpdateModal.estimatedRevenue);

  const handleConversionStatusUpdate = (conversionId: number, currentStatus: string) => {
    const nextStatus = getNextStatus(currentStatus);
    if (nextStatus) {
      setStatusUpdateModal({
        open: true,
        conversionId,
        currentStatus,
        newStatus: nextStatus,
        memo: '',
        estimatedRevenue: 500000,
      });
    }
  };

  const handleConversionMemoEdit = (conversionId: number, memo: string) => {
    setMemoModal({
      open: true,
      conversionId,
      memo,
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-slate-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <Link href="/tracking">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="text-3xl">📋</div>
        <h1 className="text-3xl font-bold text-white">自分のコンバージョン</h1>
      </div>

      {/* 検索 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="名前で検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchData()}
          className="pl-10"
        />
      </div>

      {/* フィルター */}
      <Card className="border-slate-700 bg-slate-900/50 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={linkType} onValueChange={setLinkType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全タイプ</SelectItem>
              <SelectItem value="recruit">🌙 キャスト募集</SelectItem>
              <SelectItem value="app_invite">💎 アプリ紹介</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全ステータス</SelectItem>
              <SelectItem value="submitted">応募</SelectItem>
              <SelectItem value="contacted">連絡済み</SelectItem>
              <SelectItem value="interviewed">面接</SelectItem>
              <SelectItem value="trial">体入</SelectItem>
              <SelectItem value="hired">採用</SelectItem>
              <SelectItem value="active">稼働中</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">新しい順</SelectItem>
              <SelectItem value="oldest">古い順</SelectItem>
              <SelectItem value="sb_desc">SB高い順</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* コンバージョン一覧 */}
      <div className="space-y-3">
        {data?.conversions.map((conv) => (
          <ConversionCard
            key={conv.id}
            id={conv.id}
            applicantName={conv.applicant_name}
            applicantAge={conv.applicant_age || undefined}
            linkType={conv.link_type}
            shopName={conv.shop_name || undefined}
            status={conv.status}
            createdAt={conv.created_at}
            sbAmount={conv.sb_amount}
            sbPaid={conv.sb_paid}
            memo={conv.memo || undefined}
            timeline={conv.timeline}
            onStatusUpdate={handleConversionStatusUpdate}
            onMemoEdit={handleConversionMemoEdit}
          />
        ))}
      </div>

      {/* ページネーション */}
      {data && data.total_pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
            前へ
          </Button>
          <span className="flex items-center px-4 text-slate-400">
            {page} / {data.total_pages}
          </span>
          <Button variant="outline" disabled={page === data.total_pages} onClick={() => setPage(page + 1)}>
            次へ
          </Button>
        </div>
      )}

      {data?.conversions.length === 0 && (
        <Card className="border-slate-700 bg-slate-900/50 p-12 text-center">
          <p className="text-slate-400">該当するコンバージョンがありません</p>
        </Card>
      )}

      {/* ステータス更新モーダル */}
      <Dialog open={statusUpdateModal.open} onOpenChange={(open) => setStatusUpdateModal({ ...statusUpdateModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              ステータスを「{statusUpdateModal.newStatus}」に進めますか？
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {statusUpdateModal.newStatus === 'hired' && (
              <>
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">推定月間売上</label>
                  <Slider
                    min={100000}
                    max={2000000}
                    step={100000}
                    value={[statusUpdateModal.estimatedRevenue]}
                    onValueChange={([value]) => setStatusUpdateModal({ ...statusUpdateModal, estimatedRevenue: value })}
                  />
                  <p className="text-center text-lg font-bold text-white mt-2">
                    ¥{statusUpdateModal.estimatedRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[#00C4CC]/10 border border-[#00C4CC]">
                  <p className="text-sm text-slate-300">SBプレビュー</p>
                  <p className="text-xl font-bold text-[#00C4CC]">
                    SB: ¥{sb.toLocaleString()} → あなたの手取り: ¥{scoutShare.toLocaleString()}
                  </p>
                </div>
              </>
            )}
            <Textarea
              placeholder="メモ（任意）"
              value={statusUpdateModal.memo}
              onChange={(e) => setStatusUpdateModal({ ...statusUpdateModal, memo: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setStatusUpdateModal({
                  open: false,
                  conversionId: null,
                  currentStatus: '',
                  newStatus: '',
                  memo: '',
                  estimatedRevenue: 500000,
                })
              }
            >
              キャンセル
            </Button>
            <Button onClick={handleStatusUpdate}>
              {statusUpdateModal.newStatus === 'hired' ? '✅ 採用確定' : '更新'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* メモ編集モーダル */}
      <Dialog open={memoModal.open} onOpenChange={(open) => setMemoModal({ ...memoModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>メモを編集</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="メモを入力..."
            value={memoModal.memo}
            onChange={(e) => setMemoModal({ ...memoModal, memo: e.target.value })}
            rows={5}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemoModal({ open: false, conversionId: null, memo: '' })}>
              キャンセル
            </Button>
            <Button onClick={handleMemoUpdate}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MyConversionsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><p className="text-slate-400">読み込み中...</p></div>}>
      <MyConversionsContent />
    </Suspense>
  );
}
