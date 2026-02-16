'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

interface Conversion {
  id: number;
  scout_name: string;
  scout_id: number;
  link_type: 'recruit' | 'app_invite';
  applicant_name: string;
  applicant_line_id: string;
  applicant_age: number | null;
  status: string;
  shop_name: string | null;
  created_at: string;
  updated_at: string;
  sb_amount: number;
  sb_paid: boolean;
  memo: string | null;
  timeline: Array<{
    status: string;
    timestamp: string;
  }>;
}

interface ConversionListResponse {
  conversions: Conversion[];
  total: number;
  page: number;
  total_pages: number;
  status_summary: {
    submitted: number;
    contacted: number;
    interviewed: number;
    trial: number;
    hired: number;
    active: number;
  };
}

export default function MasterConversionsPage() {
  const [data, setData] = useState<ConversionListResponse | null>(null);
  const [linkType, setLinkType] = useState('all');
  const [status, setStatus] = useState('all');
  const [scoutFilter, setScoutFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // モーダル状態
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

  const [sbAdjustModal, setSbAdjustModal] = useState<{
    open: boolean;
    conversionId: number | null;
    sbAmount: number;
    shareRate: number;
  }>({
    open: false,
    conversionId: null,
    sbAmount: 125000,
    shareRate: 70,
  });

  const [sbPayModal, setSbPayModal] = useState<{
    open: boolean;
    conversionId: number | null;
  }>({
    open: false,
    conversionId: null,
  });

  const API_BASE_URL = 'https://smartnr-backend.onrender.com';
  const MASTER_ID = 3;

  useEffect(() => {
    fetchData();
  }, [linkType, status, scoutFilter, sortBy, page]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({
        master_id: String(MASTER_ID),
        page: String(page),
        limit: '20',
        sort_by: sortBy,
      });
      
      if (linkType !== 'all') params.append('link_type', linkType);
      if (status !== 'all') params.append('status', status);
      if (scoutFilter !== 'all') params.append('scout_id', scoutFilter);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`${API_BASE_URL}/api/master/tracking/conversions?${params.toString()}`);
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
      master_id: MASTER_ID,
      new_status: statusUpdateModal.newStatus,
      memo: statusUpdateModal.memo || null,
    };

    if (statusUpdateModal.newStatus === 'hired') {
      body.estimated_revenue = statusUpdateModal.estimatedRevenue;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/master/tracking/conversions/${statusUpdateModal.conversionId}/status`,
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

  const handleSbAdjust = async () => {
    if (!sbAdjustModal.conversionId) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/master/tracking/conversions/${sbAdjustModal.conversionId}/sb`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            master_id: MASTER_ID,
            sb_amount: sbAdjustModal.sbAmount,
            share_rate: sbAdjustModal.shareRate,
          }),
        }
      );

      if (res.ok) {
        fetchData();
        setSbAdjustModal({ open: false, conversionId: null, sbAmount: 125000, shareRate: 70 });
      }
    } catch (err) {
      console.error('Failed to adjust SB:', err);
    }
  };

  const handleSbPay = async () => {
    if (!sbPayModal.conversionId) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/master/tracking/conversions/${sbPayModal.conversionId}/sb`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            master_id: MASTER_ID,
            is_sb_paid: true,
          }),
        }
      );

      if (res.ok) {
        fetchData();
        setSbPayModal({ open: false, conversionId: null });
      }
    } catch (err) {
      console.error('Failed to mark as paid:', err);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'bg-slate-500/20 text-slate-400 border-slate-500',
      contacted: 'bg-blue-500/20 text-blue-400 border-blue-500',
      interviewed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
      trial: 'bg-orange-500/20 text-orange-400 border-orange-500',
      hired: 'bg-green-500/20 text-green-400 border-green-500',
      active: 'bg-[#00C4CC]/20 text-[#00C4CC] border-[#00C4CC]',
      churned: 'bg-red-500/20 text-red-400 border-red-500',
      rejected: 'bg-gray-500/20 text-gray-400 border-gray-500',
    };
    return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      submitted: '応募',
      contacted: '連絡済み',
      interviewed: '面接',
      trial: '体入',
      hired: '採用',
      active: '稼働中',
      churned: '離脱',
      rejected: '不採用',
    };
    return labels[status] || status;
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
  const scoutShareFromAdjust = Math.floor((sbAdjustModal.sbAmount * sbAdjustModal.shareRate) / 100);

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/master/tracking">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="text-3xl">📋</div>
          <h1 className="text-3xl font-bold text-white">全コンバージョン</h1>
        </div>
        {data && (
          <Badge variant="outline" className="text-lg px-4 py-2">
            全{data.total}件
          </Badge>
        )}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <Select value={scoutFilter} onValueChange={setScoutFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全スカウト</SelectItem>
              {/* TODO: 動的にスカウト一覧を取得 */}
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

      {/* ステータス集計 */}
      {data?.status_summary && (
        <Card className="border-slate-700 bg-slate-900/50 p-4">
          <h3 className="text-sm font-bold text-slate-400 mb-3">📊 ステータス集計</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.status_summary).map(([key, count]) => (
              <Button
                key={key}
                size="sm"
                variant={status === key ? 'default' : 'outline'}
                onClick={() => setStatus(key)}
              >
                {getStatusLabel(key)} {count}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* コンバージョンリスト */}
      <div className="space-y-3">
        {data?.conversions.map((conv) => {
          const nextStatus = getNextStatus(conv.status);
          return (
            <Card key={conv.id} className="border-slate-700 bg-slate-900/50 p-4">
              <div className="space-y-3">
                {/* ヘッダー */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {conv.link_type === 'recruit' ? '🌙' : '💎'}
                    <span className="text-white font-bold">
                      {conv.applicant_name}
                      {conv.applicant_age && `（${conv.applicant_age}歳）`}
                    </span>
                    {conv.status === 'submitted' && <Badge variant="outline">🆕</Badge>}
                  </div>
                  <Badge variant="outline" className={getStatusBadgeColor(conv.status)}>
                    {getStatusLabel(conv.status)}
                  </Badge>
                </div>

                {/* 詳細情報 */}
                <div className="space-y-1 text-sm text-slate-400">
                  <p>担当: {conv.scout_name}</p>
                  {conv.shop_name && <p>店舗: {conv.shop_name}</p>}
                  {conv.timeline && conv.timeline.length > 0 && (
                    <p className="text-xs">
                      {conv.timeline.map((t, idx) => (
                        <span key={idx}>
                          {idx > 0 && ' → '}
                          {getStatusLabel(t.status)}:{new Date(t.timestamp).toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' })}
                        </span>
                      ))}
                    </p>
                  )}
                  {conv.memo && (
                    <p className="text-xs bg-slate-800 p-2 rounded">メモ: {conv.memo}</p>
                  )}
                </div>

                {/* SB情報 */}
                {conv.sb_amount > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="bg-[#00C4CC]/20 text-[#00C4CC] border-[#00C4CC]">
                      SB: ¥{conv.sb_amount.toLocaleString()}
                    </Badge>
                    <Badge variant="outline" className="bg-slate-700 text-slate-300">
                      手取り: ¥{Math.floor(conv.sb_amount * 0.7).toLocaleString()}
                    </Badge>
                    {conv.sb_paid ? (
                      <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
                        🟢 支払済
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500 animate-pulse">
                        🔴 未払
                      </Badge>
                    )}
                  </div>
                )}

                {/* アクション */}
                <div className="flex flex-wrap gap-2">
                  {nextStatus && (
                    <Button
                      size="sm"
                      onClick={() =>
                        setStatusUpdateModal({
                          open: true,
                          conversionId: conv.id,
                          currentStatus: conv.status,
                          newStatus: nextStatus,
                          memo: '',
                          estimatedRevenue: 500000,
                        })
                      }
                    >
                      {getStatusLabel(nextStatus)}に進める ▶
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setStatusUpdateModal({
                        open: true,
                        conversionId: conv.id,
                        currentStatus: conv.status,
                        newStatus: conv.status,
                        memo: conv.memo || '',
                        estimatedRevenue: 500000,
                      })
                    }
                  >
                    ✏️ メモ
                  </Button>
                  {conv.sb_amount > 0 && !conv.sb_paid && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSbPayModal({ open: true, conversionId: conv.id })}
                      >
                        ✅ SB支払い済みにする
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setSbAdjustModal({
                            open: true,
                            conversionId: conv.id,
                            sbAmount: conv.sb_amount,
                            shareRate: 70,
                          })
                        }
                      >
                        💰 SB調整
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ページネーション */}
      {data && data.total_pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            前へ
          </Button>
          <span className="flex items-center px-4 text-slate-400">
            {page} / {data.total_pages}
          </span>
          <Button
            variant="outline"
            disabled={page === data.total_pages}
            onClick={() => setPage(page + 1)}
          >
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
      <Dialog
        open={statusUpdateModal.open}
        onOpenChange={(open) => setStatusUpdateModal({ ...statusUpdateModal, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {statusUpdateModal.currentStatus === statusUpdateModal.newStatus
                ? 'メモを編集'
                : `ステータスを「${getStatusLabel(statusUpdateModal.newStatus)}」に進めますか？`}
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
                    onValueChange={([value]) =>
                      setStatusUpdateModal({ ...statusUpdateModal, estimatedRevenue: value })
                    }
                  />
                  <p className="text-center text-lg font-bold text-white mt-2">
                    ¥{statusUpdateModal.estimatedRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[#00C4CC]/10 border border-[#00C4CC]">
                  <p className="text-sm text-slate-300">SBプレビュー</p>
                  <p className="text-xl font-bold text-[#00C4CC]">
                    SB: ¥{sb.toLocaleString()} → スカウト手取り: ¥{scoutShare.toLocaleString()}
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
              {statusUpdateModal.newStatus === 'hired' ? '✅ 採用確定＋SB計算' : '更新'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SB調整モーダル */}
      <Dialog
        open={sbAdjustModal.open}
        onOpenChange={(open) => setSbAdjustModal({ ...sbAdjustModal, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>💰 SB調整</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">SB金額</label>
              <Input
                type="number"
                value={sbAdjustModal.sbAmount}
                onChange={(e) =>
                  setSbAdjustModal({ ...sbAdjustModal, sbAmount: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">分配率 (%)</label>
              <Slider
                min={50}
                max={100}
                step={5}
                value={[sbAdjustModal.shareRate]}
                onValueChange={([value]) => setSbAdjustModal({ ...sbAdjustModal, shareRate: value })}
              />
              <p className="text-center text-lg font-bold text-white mt-2">{sbAdjustModal.shareRate}%</p>
            </div>
            <div className="p-4 rounded-lg bg-[#00C4CC]/10 border border-[#00C4CC]">
              <p className="text-sm text-slate-300">スカウト手取り</p>
              <p className="text-xl font-bold text-[#00C4CC]">¥{scoutShareFromAdjust.toLocaleString()}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setSbAdjustModal({ open: false, conversionId: null, sbAmount: 125000, shareRate: 70 })
              }
            >
              キャンセル
            </Button>
            <Button onClick={handleSbAdjust}>💰 更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SB支払い確認モーダル */}
      <Dialog open={sbPayModal.open} onOpenChange={(open) => setSbPayModal({ ...sbPayModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>SB支払い確認</DialogTitle>
            <DialogDescription>このSBを支払い済みにしますか？</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSbPayModal({ open: false, conversionId: null })}>
              キャンセル
            </Button>
            <Button onClick={handleSbPay}>✅ 支払い済みにする</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
