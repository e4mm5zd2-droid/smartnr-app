'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { ArrowLeft, Check, Clock } from 'lucide-react';

interface SBPayment {
  scout_id: number;
  scout_name: string;
  recruit_sb: number;
  unpaid_recruit_sb: number;
  paid_recruit_sb: number;
  conversions_count: number;
  unpaid_conversions: Array<{
    id: number;
    applicant_name: string;
    shop_name: string | null;
    sb_amount: number;
    hired_at: string;
  }>;
}

interface SBPaymentsResponse {
  payments: SBPayment[];
  total_sb: number;
  total_unpaid_sb: number;
  total_paid_sb: number;
  period: string;
}

export default function MasterSBPaymentsPage() {
  const [data, setData] = useState<SBPaymentsResponse | null>(null);
  const [period, setPeriod] = useState('2026-02');
  const [loading, setLoading] = useState(true);
  const [expandedScout, setExpandedScout] = useState<number | null>(null);

  const API_BASE_URL = 'https://smartnr-backend.onrender.com';
  const MASTER_ID = 3;

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/master/tracking/sb-payments?master_id=${MASTER_ID}&period=${period}`
      );
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch SB payments:', err);
    } finally {
      setLoading(false);
    }
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
          <div className="text-3xl">💰</div>
          <h1 className="text-3xl font-bold text-white">SB支払い管理</h1>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2026-02">今月（2月）</SelectItem>
            <SelectItem value="2026-01">先月（1月）</SelectItem>
            <SelectItem value="2026">今年（2026）</SelectItem>
            <SelectItem value="all">全期間</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* サマリーカード */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-slate-700 bg-slate-900/50 p-6">
            <p className="text-sm text-slate-400 mb-1">総SB</p>
            <p className="text-3xl font-bold text-white">
              ¥{Math.floor(data.total_sb / 10000).toLocaleString()}万
            </p>
          </Card>
          <Card className="border-slate-700 bg-slate-900/50 p-6">
            <p className="text-sm text-slate-400 mb-1 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              未払いSB
            </p>
            <p className="text-3xl font-bold text-[#FF6B6B]">
              ¥{Math.floor(data.total_unpaid_sb / 10000).toLocaleString()}万
            </p>
          </Card>
          <Card className="border-slate-700 bg-slate-900/50 p-6">
            <p className="text-sm text-slate-400 mb-1 flex items-center gap-2">
              <Check className="h-4 w-4" />
              支払済SB
            </p>
            <p className="text-3xl font-bold text-[#00C4CC]">
              ¥{Math.floor(data.total_paid_sb / 10000).toLocaleString()}万
            </p>
          </Card>
        </div>
      )}

      {/* スカウト別SB一覧 */}
      <div className="space-y-3">
        {data?.payments.map((payment) => (
          <Card key={payment.scout_id} className="border-slate-700 bg-slate-900/50 p-6">
            <div className="space-y-4">
              {/* スカウト名・金額サマリー */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{payment.scout_name}</h3>
                  <p className="text-sm text-slate-400">
                    採用数: {payment.conversions_count}件
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm text-slate-400">合計SB</p>
                  <p className="text-2xl font-bold text-white">
                    ¥{payment.recruit_sb.toLocaleString()}
                  </p>
                  <div className="flex gap-2 justify-end">
                    <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500">
                      未払 ¥{payment.unpaid_recruit_sb.toLocaleString()}
                    </Badge>
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
                      支払済 ¥{payment.paid_recruit_sb.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 未払いリスト（展開可能） */}
              {payment.unpaid_conversions.length > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setExpandedScout(
                        expandedScout === payment.scout_id ? null : payment.scout_id
                      )
                    }
                    className="w-full text-slate-400 hover:text-white"
                  >
                    {expandedScout === payment.scout_id ? '▼' : '▶'} 未払い明細を表示（
                    {payment.unpaid_conversions.length}件）
                  </Button>

                  {expandedScout === payment.scout_id && (
                    <div className="space-y-2 pl-4 border-l-2 border-slate-700">
                      {payment.unpaid_conversions.map((conv) => (
                        <div
                          key={conv.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50"
                        >
                          <div>
                            <p className="text-white font-medium">{conv.applicant_name}</p>
                            {conv.shop_name && (
                              <p className="text-sm text-slate-400">{conv.shop_name}</p>
                            )}
                            <p className="text-xs text-slate-500">
                              採用日: {new Date(conv.hired_at).toLocaleDateString('ja-JP')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#00C4CC] font-bold">
                              ¥{conv.sb_amount.toLocaleString()}
                            </p>
                            <Button size="sm" variant="outline" className="mt-2">
                              支払済にする
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      {data?.payments.length === 0 && (
        <Card className="border-slate-700 bg-slate-900/50 p-12 text-center">
          <p className="text-slate-400">SB支払いデータがありません</p>
        </Card>
      )}
    </div>
  );
}
