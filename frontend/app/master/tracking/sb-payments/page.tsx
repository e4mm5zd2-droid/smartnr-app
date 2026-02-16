'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Link from 'next/link';
import { ArrowLeft, Check, Clock } from 'lucide-react';

interface Conversion {
  id: number;
  applicant_name: string;
  shop_name: string | null;
  sb_amount: number;
  hired_at: string;
}

interface SBPayment {
  scout_id: number;
  scout_name: string;
  recruit_sb: number;
  unpaid_recruit_sb: number;
  paid_recruit_sb: number;
  conversions_count: number;
  unpaid_conversions: Conversion[];
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
  const [filterPaid, setFilterPaid] = useState('unpaid');
  const [scoutFilter, setScoutFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [expandedScout, setExpandedScout] = useState<number | null>(null);
  const [selectedConversions, setSelectedConversions] = useState<Set<number>>(new Set());

  // モーダル
  const [bulkPayModal, setBulkPayModal] = useState<{
    open: boolean;
    scoutId: number | null;
    conversionIds: number[];
    totalAmount: number;
  }>({
    open: false,
    scoutId: null,
    conversionIds: [],
    totalAmount: 0,
  });

  const [payAllModal, setPayAllModal] = useState<{
    open: boolean;
    totalAmount: number;
    totalCount: number;
  }>({
    open: false,
    totalAmount: 0,
    totalCount: 0,
  });

  const API_BASE_URL = 'https://smartnr-backend.onrender.com';
  const MASTER_ID = 3;

  useEffect(() => {
    fetchData();
  }, [period, filterPaid, scoutFilter]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({
        master_id: String(MASTER_ID),
        period,
      });

      if (filterPaid !== 'all') params.append('paid', filterPaid === 'paid' ? 'true' : 'false');
      if (scoutFilter !== 'all') params.append('scout_id', scoutFilter);

      const res = await fetch(`${API_BASE_URL}/api/master/tracking/sb-payments?${params.toString()}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch SB payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConversion = (convId: number) => {
    setSelectedConversions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(convId)) {
        newSet.delete(convId);
      } else {
        newSet.add(convId);
      }
      return newSet;
    });
  };

  const handleToggleAllForScout = (scoutId: number, convIds: number[]) => {
    setSelectedConversions((prev) => {
      const newSet = new Set(prev);
      const allSelected = convIds.every((id) => newSet.has(id));
      
      if (allSelected) {
        convIds.forEach((id) => newSet.delete(id));
      } else {
        convIds.forEach((id) => newSet.add(id));
      }
      
      return newSet;
    });
  };

  const handleBulkPay = async () => {
    if (bulkPayModal.conversionIds.length === 0) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/master/tracking/conversions/bulk-pay`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          master_id: MASTER_ID,
          conversion_ids: bulkPayModal.conversionIds,
        }),
      });

      if (res.ok) {
        fetchData();
        setSelectedConversions(new Set());
        setBulkPayModal({ open: false, scoutId: null, conversionIds: [], totalAmount: 0 });
      }
    } catch (err) {
      console.error('Failed to bulk pay:', err);
    }
  };

  const handlePayAll = async () => {
    if (!data) return;

    const allUnpaidIds = data.payments.flatMap((p) => p.unpaid_conversions.map((c) => c.id));

    try {
      const res = await fetch(`${API_BASE_URL}/api/master/tracking/conversions/bulk-pay`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          master_id: MASTER_ID,
          conversion_ids: allUnpaidIds,
        }),
      });

      if (res.ok) {
        fetchData();
        setPayAllModal({ open: false, totalAmount: 0, totalCount: 0 });
      }
    } catch (err) {
      console.error('Failed to pay all:', err);
    }
  };

  const openBulkPayModal = (scoutId: number) => {
    const scout = data?.payments.find((p) => p.scout_id === scoutId);
    if (!scout) return;

    const selectedIds = scout.unpaid_conversions
      .map((c) => c.id)
      .filter((id) => selectedConversions.has(id));

    if (selectedIds.length === 0) return;

    const totalAmount = scout.unpaid_conversions
      .filter((c) => selectedIds.includes(c.id))
      .reduce((sum, c) => sum + c.sb_amount, 0);

    setBulkPayModal({
      open: true,
      scoutId,
      conversionIds: selectedIds,
      totalAmount,
    });
  };

  const openPayAllModal = () => {
    if (!data) return;

    const totalCount = data.payments.reduce((sum, p) => sum + p.unpaid_conversions.length, 0);

    setPayAllModal({
      open: true,
      totalAmount: data.total_unpaid_sb,
      totalCount,
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

      {/* フィルター */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={filterPaid === 'unpaid' ? 'default' : 'outline'}
          onClick={() => setFilterPaid('unpaid')}
        >
          🔴 未払い
        </Button>
        <Button
          size="sm"
          variant={filterPaid === 'paid' ? 'default' : 'outline'}
          onClick={() => setFilterPaid('paid')}
        >
          🟢 支払い済み
        </Button>
        <Button
          size="sm"
          variant={filterPaid === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterPaid('all')}
        >
          全て
        </Button>
      </div>

      {/* スカウト別SB一覧 */}
      <div className="space-y-3">
        {data?.payments.map((payment) => {
          const isExpanded = expandedScout === payment.scout_id;
          const scoutConvIds = payment.unpaid_conversions.map((c) => c.id);
          const selectedForThisScout = scoutConvIds.filter((id) => selectedConversions.has(id));
          const allSelectedForScout = scoutConvIds.length > 0 && selectedForThisScout.length === scoutConvIds.length;

          return (
            <Card key={payment.scout_id} className="border-slate-700 bg-slate-900/50 p-6">
              <div className="space-y-4">
                {/* スカウト名・金額サマリー */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">{payment.scout_name}</h3>
                    <p className="text-sm text-slate-400">採用数: {payment.conversions_count}件</p>
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
                        setExpandedScout(isExpanded ? null : payment.scout_id)
                      }
                      className="w-full text-slate-400 hover:text-white"
                    >
                      {isExpanded ? '▼' : '▶'} 未払い明細を表示（{payment.unpaid_conversions.length}
                      件）
                    </Button>

                    {isExpanded && (
                      <div className="space-y-2 pl-4 border-l-2 border-slate-700">
                        {/* 全選択チェックボックス */}
                        <div className="flex items-center gap-2 mb-2">
                          <Checkbox
                            checked={allSelectedForScout}
                            onCheckedChange={() =>
                              handleToggleAllForScout(payment.scout_id, scoutConvIds)
                            }
                          />
                          <span className="text-sm text-slate-400">全て選択</span>
                        </div>

                        {payment.unpaid_conversions.map((conv) => (
                          <div
                            key={conv.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50"
                          >
                            <Checkbox
                              checked={selectedConversions.has(conv.id)}
                              onCheckedChange={() => handleToggleConversion(conv.id)}
                            />
                            <div className="flex-1 flex items-center justify-between">
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
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* 選択分を支払うボタン */}
                        {selectedForThisScout.length > 0 && (
                          <Button
                            className="w-full"
                            onClick={() => openBulkPayModal(payment.scout_id)}
                          >
                            ✅ 選択分を支払い済みに（{selectedForThisScout.length}件）
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* 全て支払うボタン */}
      {data && data.total_unpaid_sb > 0 && (
        <Button className="w-full" size="lg" onClick={openPayAllModal}>
          ✅ 全て支払い済みにする（¥{data.total_unpaid_sb.toLocaleString()}）
        </Button>
      )}

      {data?.payments.length === 0 && (
        <Card className="border-slate-700 bg-slate-900/50 p-12 text-center">
          <p className="text-slate-400">SB支払いデータがありません</p>
        </Card>
      )}

      {/* 一括支払いモーダル */}
      <Dialog
        open={bulkPayModal.open}
        onOpenChange={(open) => setBulkPayModal({ ...bulkPayModal, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>選択分を支払い済みにしますか？</DialogTitle>
            <DialogDescription>
              対象: {bulkPayModal.conversionIds.length}件 / 合計: ¥
              {bulkPayModal.totalAmount.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setBulkPayModal({ open: false, scoutId: null, conversionIds: [], totalAmount: 0 })
              }
            >
              キャンセル
            </Button>
            <Button onClick={handleBulkPay}>✅ 確定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 全て支払うモーダル */}
      <Dialog open={payAllModal.open} onOpenChange={(open) => setPayAllModal({ ...payAllModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>全てのSBを支払い済みにしますか？</DialogTitle>
            <DialogDescription>
              対象: {payAllModal.totalCount}件 / 合計: ¥{payAllModal.totalAmount.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPayAllModal({ open: false, totalAmount: 0, totalCount: 0 })}
            >
              キャンセル
            </Button>
            <Button onClick={handlePayAll}>✅ 確定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
