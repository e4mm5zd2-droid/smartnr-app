'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  ArrowRight,
  TrendingUp,
  DollarSign,
  ArrowLeft,
  Star,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { calculateCommission, formatCurrency } from '@/lib/commission';

interface ShopRate {
  shop_id: number;
  shop_name: string;
  sb_type: string;
  sb_rate: number;
  area: string;
}

interface ShopSimulationResult {
  shop_id: number;
  shop_name: string;
  scout_income: number;
  annual_estimate: number;
}

export default function CommissionPage() {
  const searchParams = useSearchParams();
  const presetShopId = searchParams.get('shop_id');

  const [shops, setShops] = useState<ShopRate[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [monthlySales, setMonthlySales] = useState<number>(500000);
  const [scoutShare, setScoutShare] = useState<number>(70);
  
  const [displayIncome, setDisplayIncome] = useState<number>(0);
  const [shopComparison, setShopComparison] = useState<ShopSimulationResult[]>([]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smartnr-backend.onrender.com';

  // 店舗一覧を取得
  useEffect(() => {
    fetchShops();
  }, []);

  // プリセット店舗IDがあれば設定
  useEffect(() => {
    if (presetShopId && shops.length > 0) {
      const shop = shops.find(s => s.shop_id.toString() === presetShopId);
      if (shop) {
        setSelectedShopId(presetShopId);
      }
    }
  }, [presetShopId, shops]);

  // 店舗変更時に比較を実行
  useEffect(() => {
    if (selectedShopId) {
      fetchShopComparison();
    }
  }, [selectedShopId]);

  const fetchShops = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/commission/shop-rates`);
      if (response.ok) {
        const data = await response.json();
        setShops(data.shops || []);
        if (data.shops && data.shops.length > 0 && !selectedShopId) {
          setSelectedShopId(data.shops[0].shop_id.toString());
        }
      }
    } catch (error) {
      console.error('店舗情報取得エラー:', error);
    }
  };

  const fetchShopComparison = async () => {
    try {
      const shopIds = shops.map(s => s.shop_id);
      const response = await fetch(`${API_BASE_URL}/api/commission/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cast_estimated_sales: monthlySales,
          scout_share: scoutShare,
          shop_ids: shopIds,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setShopComparison(data.results || []);
      }
    } catch (error) {
      console.error('店舗比較エラー:', error);
    }
  };

  // リアルタイム計算
  const selectedShop = shops.find(s => s.shop_id.toString() === selectedShopId);
  const result = selectedShop
    ? calculateCommission({
        castEstimatedSales: monthlySales,
        sbType: selectedShop.sb_type as any,
        sbRate: selectedShop.sb_rate,
        scoutShare,
        paymentCycle: 'monthly',
      })
    : null;

  // カウントアニメーション
  useEffect(() => {
    if (result) {
      const targetIncome = result.scoutIncome;
      const duration = 500;
      const steps = 30;
      const increment = (targetIncome - displayIncome) / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayIncome(targetIncome);
          clearInterval(timer);
        } else {
          setDisplayIncome(prev => Math.round(prev + increment));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [result?.scoutIncome]);

  // SB率別シミュレーション
  const rateComparisons = selectedShop ? [10, 20, 30, 50].map(rate => {
    const comp = calculateCommission({
      castEstimatedSales: monthlySales,
      sbType: selectedShop.sb_type as any,
      sbRate: rate,
      scoutShare,
      paymentCycle: 'monthly',
    });
    return { rate, ...comp };
  }) : [];

  const bestShop = shopComparison.length > 0 ? shopComparison[0] : null;
  const worstShop = shopComparison.length > 0 ? shopComparison[shopComparison.length - 1] : null;
  const maxIncome = bestShop ? bestShop.scout_income : 0;

  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-6 space-y-6">
      {/* 戻るリンク */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">ダッシュボードに戻る</span>
      </Link>

      {/* ヘッダー */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-4 h-12 w-12 rounded-full" style={{ background: 'linear-gradient(135deg, #00C4CC 0%, #33D4DB 100%)' }}>
          <Calculator className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">報酬シミュレーター</h1>
        <p className="mt-2 text-sm text-slate-400">
          あなたの月収を今すぐ計算
        </p>
      </div>

      {/* 入力エリア */}
      <Card className="border-slate-800 bg-slate-900/50 p-6">
        <div className="space-y-6">
          {/* 店舗選択 */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              店舗を選択
              {selectedShop && (
                <Badge variant="outline" className="ml-auto">
                  SB: {selectedShop.sb_type === 'sales_percentage' ? `${selectedShop.sb_rate}%` : `¥${selectedShop.sb_rate.toLocaleString()}`}
                </Badge>
              )}
            </label>
            <Select value={selectedShopId} onValueChange={setSelectedShopId}>
              <SelectTrigger className="bg-slate-800 h-12 text-base">
                <SelectValue placeholder="店舗を選択" />
              </SelectTrigger>
              <SelectContent>
                {shops.map(shop => (
                  <SelectItem key={shop.shop_id} value={shop.shop_id.toString()}>
                    {shop.shop_name} ({shop.area})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 推定月間売上スライダー */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">推定月間売上</label>
              <span className="text-lg font-bold" style={{ color: '#00C4CC' }}>
                {formatCurrency(monthlySales)}
              </span>
            </div>
            <input
              type="range"
              min="100000"
              max="2000000"
              step="50000"
              value={monthlySales}
              onChange={(e) => setMonthlySales(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb-custom"
              style={{
                background: `linear-gradient(to right, #00C4CC 0%, #00C4CC ${((monthlySales - 100000) / (2000000 - 100000)) * 100}%, rgb(51 65 85) ${((monthlySales - 100000) / (2000000 - 100000)) * 100}%, rgb(51 65 85) 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>¥100,000</span>
              <span>¥2,000,000</span>
            </div>
          </div>

          {/* スカウト取分スライダー */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">スカウト取分</label>
              <span className="text-lg font-bold" style={{ color: '#00C4CC' }}>
                {scoutShare}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={scoutShare}
              onChange={(e) => setScoutShare(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb-custom"
              style={{
                background: `linear-gradient(to right, #00C4CC 0%, #00C4CC ${((scoutShare - 50) / (100 - 50)) * 100}%, rgb(51 65 85) ${((scoutShare - 50) / (100 - 50)) * 100}%, rgb(51 65 85) 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* メイン結果表示 */}
      {result && (
        <Card className="border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-900/50 p-8 text-center backdrop-blur-sm">
          <p className="text-sm text-slate-400 mb-2">あなたの月収</p>
          <p className="text-5xl md:text-6xl font-bold mb-4 transition-all duration-300" style={{ color: '#00C4CC' }}>
            {formatCurrency(displayIncome)}
          </p>
          <p className="text-lg text-slate-300">
            年収見込み: <span className="font-bold text-green-400">{formatCurrency(result.annualEstimate)}</span>
          </p>
        </Card>
      )}

      {/* フロー図 */}
      {result && (
        <Card className="border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5" style={{ color: '#00C4CC' }} />
            お金の流れ
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-center p-4 rounded-lg bg-slate-800/50">
              <p className="text-xs text-slate-400 mb-1">売上</p>
              <p className="text-xl font-bold">{formatCurrency(monthlySales)}</p>
            </div>
            <ArrowRight className="h-6 w-6 text-slate-600 rotate-90 md:rotate-0" />
            <div className="flex-1 text-center p-4 rounded-lg bg-slate-800/50">
              <p className="text-xs text-slate-400 mb-1">SB総額 ({selectedShop?.sb_rate}%)</p>
              <p className="text-xl font-bold">{formatCurrency(result.sbTotal)}</p>
            </div>
            <ArrowRight className="h-6 w-6 text-slate-600 rotate-90 md:rotate-0" />
            <div className="flex-1 text-center p-4 rounded-lg" style={{ background: 'rgba(0, 196, 204, 0.1)', border: '1px solid rgba(0, 196, 204, 0.3)' }}>
              <p className="text-xs text-slate-400 mb-1">あなた ({scoutShare}%)</p>
              <p className="text-xl font-bold" style={{ color: '#00C4CC' }}>{formatCurrency(result.scoutIncome)}</p>
            </div>
            {result.orgIncome > 0 && (
              <>
                <div className="hidden md:block text-slate-600">+</div>
                <div className="flex-1 text-center p-4 rounded-lg bg-slate-800/30">
                  <p className="text-xs text-slate-400 mb-1">組織 ({100 - scoutShare}%)</p>
                  <p className="text-xl font-bold text-slate-400">{formatCurrency(result.orgIncome)}</p>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* 店舗比較 */}
      {shopComparison.length > 0 && (
        <Card className="border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" style={{ color: '#00C4CC' }} />
            同じ女を別の店に振ったら？
          </h3>
          <p className="text-sm text-slate-400 mb-4">最大5店舗の収入比較</p>
          
          <div className="space-y-3">
            {shopComparison.slice(0, 5).map((shop, index) => (
              <div key={shop.shop_id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {index === 0 && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
                    <span className="font-medium">{shop.shop_name}</span>
                  </div>
                  <span className="font-bold" style={{ color: index === 0 ? '#00C4CC' : undefined }}>
                    {formatCurrency(shop.scout_income)}/月
                  </span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(shop.scout_income / maxIncome) * 100}%`,
                      background: index === 0 
                        ? 'linear-gradient(90deg, #00C4CC 0%, #33D4DB 100%)'
                        : 'linear-gradient(90deg, rgb(100 116 139) 0%, rgb(71 85 105) 100%)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {bestShop && worstShop && bestShop.shop_id !== worstShop.shop_id && (
            <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-yellow-400 mt-0.5" />
                <p className="text-sm text-yellow-300">
                  最高額店舗に変えると<span className="font-bold"> {formatCurrency(bestShop.scout_income - worstShop.scout_income)}/月 </span>の収入アップ！
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* SB率別シミュレーション */}
      {rateComparisons.length > 0 && (
        <Card className="border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-lg font-semibold mb-2">SB率別シミュレーション</h3>
          <p className="text-sm text-slate-400 mb-4">SBの交渉材料にどうぞ</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {rateComparisons.map((comp) => {
              const isActive = selectedShop?.sb_type === 'sales_percentage' && comp.rate === selectedShop?.sb_rate;
              return (
                <div
                  key={comp.rate}
                  className={`p-4 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-gradient-to-br from-[#00C4CC]/20 to-[#33D4DB]/10 border-2' 
                      : 'bg-slate-800/30 border'
                  }`}
                  style={isActive ? { borderColor: '#00C4CC' } : { borderColor: 'rgb(51 65 85)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={isActive ? 'default' : 'outline'} style={isActive ? { background: '#00C4CC' } : undefined}>
                      {comp.rate}%
                    </Badge>
                    {isActive && <span className="text-xs text-[#00C4CC]">現在</span>}
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(comp.scoutIncome)}</p>
                  <p className="text-xs text-slate-400 mt-1">月収</p>
                  <Separator className="my-2 bg-slate-700" />
                  <p className="text-sm font-medium text-green-400">{formatCurrency(comp.annualEstimate)}</p>
                  <p className="text-xs text-slate-400">年収</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* スタイル */}
      <style jsx>{`
        .slider-thumb-custom::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #00C4CC;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 196, 204, 0.5);
        }
        
        .slider-thumb-custom::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #00C4CC;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 196, 204, 0.5);
        }
      `}</style>
    </div>
  );
}
