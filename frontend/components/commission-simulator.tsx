/**
 * スカウトマン報酬シミュレーター
 * 
 * バックエンドAPIを使用してリアルタイムで報酬を計算・比較。
 * - 単一店舗の詳細計算
 * - SB率別比較（10%/20%/30%/50%）
 * - 複数店舗の一括比較
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  ArrowUpDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/commission';

interface ShopRate {
  shop_id: number;
  shop_name: string;
  sb_type: string;
  sb_rate: number;
  area: string;
  hiring_status: string;
}

interface RateComparison {
  rate: number;
  scout_income: number;
  annual_estimate: number;
}

interface CalculationResult {
  sb_total: number;
  scout_income: number;
  org_income: number;
  per_payment: number;
  annual_estimate: number;
  formula: string;
  rate_comparisons: RateComparison[];
}

interface ShopSimulationResult {
  shop_id: number;
  shop_name: string;
  sb_type: string;
  sb_rate: number;
  scout_income: number;
  annual_estimate: number;
  formula: string;
}

interface SimulationResponse {
  results: ShopSimulationResult[];
  best_shop: ShopSimulationResult | null;
  worst_shop: ShopSimulationResult | null;
  difference: number;
}

export function CommissionSimulator() {
  const [shops, setShops] = useState<ShopRate[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [castSales, setCastSales] = useState<string>('500000');
  const [scoutShare, setScoutShare] = useState<string>('70');
  const [paymentCycle, setPaymentCycle] = useState<'monthly' | 'bimonthly'>('monthly');
  
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smartnr-backend.onrender.com';

  // 店舗一覧を取得
  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/commission/shop-rates`);
      if (response.ok) {
        const data = await response.json();
        setShops(data.shops || []);
        if (data.shops && data.shops.length > 0) {
          setSelectedShopId(data.shops[0].shop_id.toString());
        }
      }
    } catch (error) {
      console.error('店舗情報取得エラー:', error);
    }
  };

  // 単一店舗の報酬を計算
  const calculateCommission = async () => {
    if (!selectedShopId || !castSales) {
      alert('店舗とキャスト売上を入力してください');
      return;
    }

    setCalculating(true);
    const selectedShop = shops.find(s => s.shop_id.toString() === selectedShopId);
    if (!selectedShop) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/commission/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cast_estimated_sales: parseInt(castSales),
          sb_type: selectedShop.sb_type,
          sb_rate: selectedShop.sb_rate,
          scout_share: parseFloat(scoutShare),
          payment_cycle: paymentCycle,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        alert('計算に失敗しました');
      }
    } catch (error) {
      console.error('計算エラー:', error);
      alert('計算エラーが発生しました');
    } finally {
      setCalculating(false);
    }
  };

  // 全店舗を比較
  const simulateAllShops = async () => {
    if (!castSales || shops.length === 0) {
      alert('キャスト売上を入力してください');
      return;
    }

    setCalculating(true);
    try {
      const shopIds = shops.map(s => s.shop_id);
      const response = await fetch(`${API_BASE_URL}/api/commission/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cast_estimated_sales: parseInt(castSales),
          scout_share: parseFloat(scoutShare),
          shop_ids: shopIds,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSimulation(data);
      } else {
        alert('シミュレーションに失敗しました');
      }
    } catch (error) {
      console.error('シミュレーションエラー:', error);
      alert('シミュレーションエラーが発生しました');
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 入力フォーム */}
      <Card className="border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-5 w-5" style={{ color: '#00C4CC' }} />
          <h3 className="text-lg font-semibold">報酬シミュレーション</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">店舗選択</label>
            <Select value={selectedShopId} onValueChange={setSelectedShopId}>
              <SelectTrigger className="bg-slate-800">
                <SelectValue placeholder="店舗を選択" />
              </SelectTrigger>
              <SelectContent>
                {shops.map(shop => (
                  <SelectItem key={shop.shop_id} value={shop.shop_id.toString()}>
                    {shop.shop_name} ({shop.area}) - {shop.sb_type === 'sales_percentage' ? `${shop.sb_rate}%` : `¥${shop.sb_rate.toLocaleString()}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">キャスト推定売上（月）</label>
            <Input
              type="number"
              value={castSales}
              onChange={(e) => setCastSales(e.target.value)}
              placeholder="500000"
              className="bg-slate-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">スカウト取分（%）</label>
            <Input
              type="number"
              value={scoutShare}
              onChange={(e) => setScoutShare(e.target.value)}
              placeholder="70"
              min="0"
              max="100"
              className="bg-slate-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">支払いサイクル</label>
            <Select value={paymentCycle} onValueChange={(v: 'monthly' | 'bimonthly') => setPaymentCycle(v)}>
              <SelectTrigger className="bg-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">毎月</SelectItem>
                <SelectItem value="bimonthly">隔月</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            onClick={calculateCommission}
            disabled={calculating}
            className="flex-1 text-white"
            style={{ background: 'linear-gradient(135deg, #00C4CC 0%, #33D4DB 100%)' }}
          >
            {calculating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                計算中...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                計算する
              </>
            )}
          </Button>

          <Button
            onClick={simulateAllShops}
            disabled={calculating}
            variant="outline"
            className="flex-1 border-slate-700"
          >
            {calculating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                比較中...
              </>
            ) : (
              <>
                <ArrowUpDown className="mr-2 h-4 w-4" />
                全店舗比較
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* 計算結果 */}
      {result && (
        <Card className="border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5" style={{ color: '#00C4CC' }} />
            <h3 className="text-lg font-semibold">計算結果</h3>
          </div>

          <div className="space-y-4">
            {/* メイン結果 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-400">SB総額</p>
                <p className="text-xl font-bold">{formatCurrency(result.sb_total)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">スカウト収入</p>
                <p className="text-xl font-bold" style={{ color: '#00C4CC' }}>{formatCurrency(result.scout_income)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">1回支払額</p>
                <p className="text-xl font-bold">{formatCurrency(result.per_payment)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">年間推定</p>
                <p className="text-xl font-bold text-green-400">{formatCurrency(result.annual_estimate)}</p>
              </div>
            </div>

            <Separator className="bg-slate-800" />

            {/* 計算式 */}
            <div className="p-3 rounded-lg bg-slate-800/50">
              <p className="text-sm text-slate-300">{result.formula}</p>
            </div>

            {/* SB率別比較 */}
            {result.rate_comparisons && result.rate_comparisons.length > 0 && (
              <>
                <Separator className="bg-slate-800" />
                <div>
                  <p className="text-sm font-medium mb-3">SB率別比較</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {result.rate_comparisons.map((comp) => (
                      <div
                        key={comp.rate}
                        className="p-3 rounded-lg bg-slate-800/30 border border-slate-700"
                      >
                        <Badge variant="outline" className="mb-2">
                          {comp.rate}%
                        </Badge>
                        <p className="text-sm font-medium">{formatCurrency(comp.scout_income)}/月</p>
                        <p className="text-xs text-slate-400 mt-1">
                          年間 {formatCurrency(comp.annual_estimate)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* 全店舗比較結果 */}
      {simulation && (
        <Card className="border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5" style={{ color: '#00C4CC' }} />
            <h3 className="text-lg font-semibold">全店舗比較</h3>
          </div>

          {/* ベスト・ワースト */}
          {simulation.best_shop && simulation.worst_shop && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-500">最も有利</Badge>
                  <span className="font-medium">{simulation.best_shop.shop_name}</span>
                </div>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(simulation.best_shop.scout_income)}/月
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  年間 {formatCurrency(simulation.best_shop.annual_estimate)}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="destructive">最も不利</Badge>
                  <span className="font-medium">{simulation.worst_shop.shop_name}</span>
                </div>
                <p className="text-2xl font-bold text-red-400">
                  {formatCurrency(simulation.worst_shop.scout_income)}/月
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  年間 {formatCurrency(simulation.worst_shop.annual_estimate)}
                </p>
              </div>
            </div>
          )}

          {simulation.difference > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-300">
                    最大差額: {formatCurrency(simulation.difference)}/月
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    最も有利な店舗を選ぶことで、月額{formatCurrency(simulation.difference)}の収入アップが見込めます
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 全店舗ランキング */}
          <div className="space-y-2">
            <p className="text-sm font-medium mb-3">店舗ランキング</p>
            {simulation.results.map((shop, index) => (
              <div
                key={shop.shop_id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-700">
                    <span className="text-sm font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{shop.shop_name}</p>
                    <p className="text-xs text-slate-400">
                      {shop.sb_type === 'sales_percentage' ? `${shop.sb_rate}%` : `固定 ${formatCurrency(shop.sb_rate)}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{ color: index === 0 ? '#00C4CC' : undefined }}>
                    {formatCurrency(shop.scout_income)}/月
                  </p>
                  <p className="text-xs text-slate-400">
                    年間 {formatCurrency(shop.annual_estimate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
