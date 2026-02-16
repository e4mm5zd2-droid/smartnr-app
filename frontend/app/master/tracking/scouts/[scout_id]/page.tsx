'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, ExternalLink as ExternalLinkIcon, QrCode, Copy, AlertCircle } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ScoutDetail {
  scout_id: number;
  name: string;
  rank: number;
  total_clicks: number;
  total_submissions: number;
  total_hired: number;
  total_sb: number;
  cvr: number;
  monthly_data: Array<{
    month: string;
    clicks: number;
    cvr: number;
  }>;
  links: Array<{
    id: number;
    unique_code: string;
    link_type: 'recruit' | 'app_invite';
    shop_name: string | null;
    clicks: number;
    submissions: number;
    is_active: boolean;
    force_disabled: boolean;
  }>;
  conversions: Array<{
    id: number;
    applicant_name: string;
    applicant_age: number | null;
    link_type: 'recruit' | 'app_invite';
    shop_name: string | null;
    status: string;
    created_at: string;
    sb_amount: number;
    sb_paid: boolean;
  }>;
}

export default function ScoutDetailPage({ params }: { params: Promise<{ scout_id: string }> }) {
  const { scout_id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<ScoutDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  // モーダル状態
  const [disableLinkModal, setDisableLinkModal] = useState<{ open: boolean; linkId: number | null; reason: string }>({
    open: false,
    linkId: null,
    reason: '',
  });
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

  const API_BASE_URL = 'https://smartnr-backend.onrender.com';
  const MASTER_ID = 3;

  useEffect(() => {
    fetchData();
  }, [scout_id]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/master/tracking/scouts/${scout_id}?master_id=${MASTER_ID}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch scout detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableLink = async () => {
    if (!disableLinkModal.linkId) return;
    
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/master/tracking/links/${disableLinkModal.linkId}/force-toggle`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            master_id: MASTER_ID,
            reason: disableLinkModal.reason || null,
          }),
        }
      );
      
      if (res.ok) {
        fetchData();
        setDisableLinkModal({ open: false, linkId: null, reason: '' });
      }
    } catch (err) {
      console.error('Failed to toggle link:', err);
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

  const calculateSB = (revenue: number) => {
    const sb = Math.floor(revenue * 0.25);
    const scoutShare = Math.floor(sb * 0.7);
    return { sb, scoutShare };
  };

  const filteredConversions = data?.conversions.filter(conv => {
    if (filter === 'all') return true;
    if (filter === 'recruit') return conv.link_type === 'recruit';
    if (filter === 'app') return conv.link_type === 'app_invite';
    return conv.status === filter;
  }) || [];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-slate-400">読み込み中...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-slate-400">スカウトが見つかりません</p>
      </div>
    );
  }

  const { sb, scoutShare } = calculateSB(statusUpdateModal.estimatedRevenue);

  return (
    <div className="space-y-6 p-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <Link href="/master/tracking?tab=scouts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">👤 {data.name}</h1>
            <Badge variant="outline" style={{ borderColor: '#FFD700', color: '#FFD700' }}>
              ランク: {data.rank === 1 ? '🥇' : data.rank === 2 ? '🥈' : data.rank === 3 ? '🥉' : `${data.rank}位`}
            </Badge>
          </div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="クリック" value={data.total_clicks} />
        <StatCard title="応募" value={data.total_submissions} />
        <StatCard title="採用" value={data.total_hired} />
        <StatCard title="SB" value={`¥${Math.floor(data.total_sb / 10000)}万`} accent="#00C4CC" />
      </div>

      {/* 月別推移グラフ */}
      <Card className="border-slate-700 bg-slate-900/50 p-6">
        <h3 className="text-lg font-bold text-white mb-4">📈 月別推移</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data.monthly_data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis yAxisId="left" stroke="#00C4CC" />
            <YAxis yAxisId="right" orientation="right" stroke="#00C4CC" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="clicks" fill="#00C4CC" name="クリック" opacity={0.6} />
            <Line yAxisId="right" type="monotone" dataKey="cvr" stroke="#00C4CC" strokeWidth={3} name="CVR (%)" />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* 発行済みリンク */}
      <Card className="border-slate-700 bg-slate-900/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">🔗 発行済みリンク</h3>
          <Button size="sm" variant="outline">
            + このスカウトにリンクを発行
          </Button>
        </div>
        <div className="space-y-3">
          {data.links.map((link) => (
            <div
              key={link.id}
              className="p-4 rounded-lg border border-slate-700 bg-slate-800/50"
              style={link.force_disabled ? { opacity: 0.5 } : undefined}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {link.link_type === 'recruit' ? '🌙' : '💎'} <span className="font-mono text-sm text-slate-300">{link.unique_code}</span>
                    {link.force_disabled ? (
                      <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500">
                        🔴 停止中
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
                        🟢 有効
                      </Badge>
                    )}
                  </div>
                </div>
                {link.shop_name && (
                  <p className="text-sm text-slate-400">→ {link.shop_name}</p>
                )}
                <div className="text-sm text-slate-400">
                  クリック: {link.clicks} | {link.link_type === 'recruit' ? '応募' : '登録'}: {link.submissions}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-1" /> URL
                  </Button>
                  <Button size="sm" variant="outline">
                    <QrCode className="h-4 w-4 mr-1" /> QR
                  </Button>
                  {link.force_disabled ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-green-500/20 text-green-400 border-green-500"
                      onClick={() => setDisableLinkModal({ open: true, linkId: link.id, reason: '' })}
                    >
                      🟢 再開
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-red-500/20 text-red-400 border-red-500"
                      onClick={() => setDisableLinkModal({ open: true, linkId: link.id, reason: '' })}
                    >
                      🔴 強制停止
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* コンバージョン一覧 */}
      <Card className="border-slate-700 bg-slate-900/50 p-6">
        <h3 className="text-lg font-bold text-white mb-4">📋 コンバージョン一覧</h3>
        
        {/* フィルター */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button size="sm" variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
            全て
          </Button>
          <Button size="sm" variant={filter === 'recruit' ? 'default' : 'outline'} onClick={() => setFilter('recruit')}>
            🌙 募集
          </Button>
          <Button size="sm" variant={filter === 'app' ? 'default' : 'outline'} onClick={() => setFilter('app')}>
            💎 アプリ
          </Button>
          <Button size="sm" variant={filter === 'submitted' ? 'default' : 'outline'} onClick={() => setFilter('submitted')}>
            応募
          </Button>
          <Button size="sm" variant={filter === 'contacted' ? 'default' : 'outline'} onClick={() => setFilter('contacted')}>
            連絡済
          </Button>
          <Button size="sm" variant={filter === 'interviewed' ? 'default' : 'outline'} onClick={() => setFilter('interviewed')}>
            面接
          </Button>
          <Button size="sm" variant={filter === 'trial' ? 'default' : 'outline'} onClick={() => setFilter('trial')}>
            体入
          </Button>
          <Button size="sm" variant={filter === 'hired' ? 'default' : 'outline'} onClick={() => setFilter('hired')}>
            採用
          </Button>
          <Button size="sm" variant={filter === 'active' ? 'default' : 'outline'} onClick={() => setFilter('active')}>
            稼働中
          </Button>
        </div>

        {/* コンバージョンカード */}
        <div className="space-y-3">
          {filteredConversions.map((conv) => {
            const nextStatus = getNextStatus(conv.status);
            return (
              <div key={conv.id} className="p-4 rounded-lg border border-slate-700 bg-slate-800/50">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {conv.link_type === 'recruit' ? '🌙' : '💎'}
                      <span className="text-white font-bold">
                        {conv.applicant_name}{conv.applicant_age ? `（${conv.applicant_age}歳）` : ''}
                      </span>
                      {conv.status === 'submitted' && <Badge variant="outline">🆕</Badge>}
                    </div>
                    <Badge variant="outline" className="bg-slate-700 text-slate-300">
                      {getStatusLabel(conv.status)}
                    </Badge>
                  </div>
                  {conv.shop_name && (
                    <p className="text-sm text-slate-400">店舗: {conv.shop_name}</p>
                  )}
                  <p className="text-xs text-slate-500">
                    {new Date(conv.created_at).toLocaleDateString('ja-JP')}
                  </p>
                  {conv.sb_amount > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-[#00C4CC]/20 text-[#00C4CC] border-[#00C4CC]">
                        SB: ¥{conv.sb_amount.toLocaleString()}
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
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* リンク停止/再開モーダル */}
      <Dialog open={disableLinkModal.open} onOpenChange={(open) => setDisableLinkModal({ ...disableLinkModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>リンクを{disableLinkModal.linkId && data?.links.find(l => l.id === disableLinkModal.linkId)?.force_disabled ? '再開' : '停止'}しますか？</DialogTitle>
            <DialogDescription>
              {disableLinkModal.linkId && !data?.links.find(l => l.id === disableLinkModal.linkId)?.force_disabled && '停止理由（任意）'}
            </DialogDescription>
          </DialogHeader>
          {disableLinkModal.linkId && !data?.links.find(l => l.id === disableLinkModal.linkId)?.force_disabled && (
            <Textarea
              placeholder="停止理由を入力..."
              value={disableLinkModal.reason}
              onChange={(e) => setDisableLinkModal({ ...disableLinkModal, reason: e.target.value })}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableLinkModal({ open: false, linkId: null, reason: '' })}>
              キャンセル
            </Button>
            <Button onClick={handleDisableLink}>
              {disableLinkModal.linkId && data?.links.find(l => l.id === disableLinkModal.linkId)?.force_disabled ? '🟢 再開する' : '🔴 停止する'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ステータス更新モーダル */}
      <Dialog open={statusUpdateModal.open} onOpenChange={(open) => setStatusUpdateModal({ ...statusUpdateModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              ステータスを「{getStatusLabel(statusUpdateModal.newStatus)}」に進めますか？
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
    </div>
  );
}

function StatCard({ title, value, accent }: { title: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-xl p-4 backdrop-blur-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
      <p className="text-xs text-slate-400 mb-1">{title}</p>
      <p className="text-2xl font-bold" style={{ color: accent || '#FFFFFF' }}>
        {value}
      </p>
    </div>
  );
}
