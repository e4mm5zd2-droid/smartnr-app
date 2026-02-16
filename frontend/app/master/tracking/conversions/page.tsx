'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';

interface Conversion {
  id: number;
  scout_name: string;
  scout_id: number;
  link_type: 'recruit' | 'app_invite';
  applicant_name: string;
  applicant_line_id: string;
  status: string;
  shop_name: string | null;
  created_at: string;
  updated_at: string;
  sb_amount: number;
  sb_paid: boolean;
}

interface ConversionListResponse {
  conversions: Conversion[];
  total: number;
  filters: {
    link_type: string | null;
    status: string | null;
    period: string;
  };
}

export default function MasterConversionsPage() {
  const [data, setData] = useState<ConversionListResponse | null>(null);
  const [linkType, setLinkType] = useState('all');
  const [status, setStatus] = useState('all');
  const [period, setPeriod] = useState('2026-02');
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'https://smartnr-backend.onrender.com';
  const MASTER_ID = 3;

  useEffect(() => {
    fetchData();
  }, [linkType, status, period]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({
        master_id: String(MASTER_ID),
        period,
      });
      
      if (linkType !== 'all') params.append('link_type', linkType);
      if (status !== 'all') params.append('status', status);

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

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'bg-blue-500/20 text-blue-400 border-blue-500',
      contacted: 'bg-cyan-500/20 text-cyan-400 border-cyan-500',
      interviewed: 'bg-purple-500/20 text-purple-400 border-purple-500',
      trial: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
      hired: 'bg-green-500/20 text-green-400 border-green-500',
      active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500',
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

      {/* フィルター */}
      <Card className="border-slate-700 bg-slate-900/50 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026-02">今月（2月）</SelectItem>
              <SelectItem value="2026-01">先月（1月）</SelectItem>
              <SelectItem value="2026">今年（2026）</SelectItem>
              <SelectItem value="all">全期間</SelectItem>
            </SelectContent>
          </Select>

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
              <SelectItem value="churned">離脱</SelectItem>
              <SelectItem value="rejected">不採用</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* コンバージョンリスト */}
      <div className="space-y-3">
        {data?.conversions.map((conv) => (
          <Card key={conv.id} className="border-slate-700 bg-slate-900/50 p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* 左側：応募者情報 */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getStatusBadgeColor(conv.status)}>
                    {getStatusLabel(conv.status)}
                  </Badge>
                  {conv.link_type === 'recruit' ? (
                    <span className="text-sm text-[#00C4CC]">🌙 募集</span>
                  ) : (
                    <span className="text-sm text-[#FF69B4]">💎 アプリ</span>
                  )}
                  {conv.sb_paid && (
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
                      💰 支払済
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-white font-bold">{conv.applicant_name}</p>
                  <p className="text-sm text-slate-400">LINE: {conv.applicant_line_id}</p>
                  {conv.shop_name && (
                    <p className="text-sm text-slate-400">店舗: {conv.shop_name}</p>
                  )}
                </div>
              </div>

              {/* 右側：スカウト・SB */}
              <div className="space-y-2 text-right">
                <div>
                  <p className="text-sm text-slate-400">担当スカウト</p>
                  <p className="text-white font-medium">{conv.scout_name}</p>
                </div>
                {conv.sb_amount > 0 && (
                  <div>
                    <p className="text-sm text-slate-400">SB</p>
                    <p className="text-[#00C4CC] font-bold">¥{conv.sb_amount.toLocaleString()}</p>
                  </div>
                )}
                <p className="text-xs text-slate-500">
                  {new Date(conv.created_at).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {data?.conversions.length === 0 && (
        <Card className="border-slate-700 bg-slate-900/50 p-12 text-center">
          <p className="text-slate-400">該当するコンバージョンがありません</p>
        </Card>
      )}
    </div>
  );
}
