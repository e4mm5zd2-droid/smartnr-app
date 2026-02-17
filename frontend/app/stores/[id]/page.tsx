'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Users,
  Clock,
  Phone,
  Mail,
  Building2,
  Star,
  TrendingUp,
} from 'lucide-react';

export default function StoreDetailPage() {
  const params = useParams();
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/stores/${params.id}`
        );
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setStore(data);
      } catch (error) {
        console.error('店舗詳細取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchStore();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-slate-800" />
          <div className="h-64 rounded bg-slate-800" />
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="space-y-4 p-4">
        <Card className="border-slate-800 bg-slate-900/50 p-12 text-center">
          <p className="text-slate-400">店舗情報が見つかりませんでした</p>
          <Link href="/stores">
            <Button className="mt-4" variant="outline">
              一覧に戻る
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <Link href="/stores">
          <Button variant="ghost" size="icon" className="text-slate-400">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{store.name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-400">{store.area}</span>
            <Badge variant="outline" className="ml-2 border-[#00C4CC]/30 bg-[#00C4CC]/10 text-[#00C4CC]">
              {store.system_type}
            </Badge>
          </div>
        </div>
      </div>

      {/* タブ化 */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="w-full bg-slate-900/50 border border-slate-800">
          <TabsTrigger value="info" className="flex-1 data-[state=active]:bg-[#00C4CC]/20 data-[state=active]:text-[#00C4CC]">
            基本情報
          </TabsTrigger>
          <TabsTrigger value="rate" className="flex-1 data-[state=active]:bg-[#00C4CC]/20 data-[state=active]:text-[#00C4CC]">
            分配率
          </TabsTrigger>
        </TabsList>

        {/* 基本情報タブ */}
        <TabsContent value="info" className="space-y-4 mt-4">
          {/* 時給・年齢・業態・エリア */}
          <Card className="border-slate-800 bg-slate-900/50 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <DollarSign className="h-4 w-4" />
                  <span>時給</span>
                </div>
                <span className="font-semibold text-white">
                  ¥{store.hourly_wage_min?.toLocaleString()} - ¥{store.hourly_wage_max?.toLocaleString()}
                </span>
              </div>
              <Separator className="bg-slate-800" />
              {store.target_age_min && store.target_age_max && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Users className="h-4 w-4" />
                      <span>対象年齢</span>
                    </div>
                    <span className="font-medium text-white">
                      {store.target_age_min}歳 - {store.target_age_max}歳
                    </span>
                  </div>
                  <Separator className="bg-slate-800" />
                </>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Building2 className="h-4 w-4" />
                  <span>業態</span>
                </div>
                <span className="font-medium text-white">{store.system_type}</span>
              </div>
              <Separator className="bg-slate-800" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>エリア</span>
                </div>
                <span className="font-medium text-white">{store.area}</span>
              </div>
            </div>
          </Card>

          {/* 説明 */}
          {store.description && (
            <Card className="border-slate-800 bg-slate-900/50 p-4">
              <h3 className="font-semibold text-white mb-3">店舗詳細</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{store.description}</p>
            </Card>
          )}

          {/* TODO: Google MAP表示（データはDBに保持中。復活時はここを有効化） */}
          {/* <Card className="border-slate-800 bg-slate-900/50 p-4">
            <h3 className="font-semibold text-white mb-3">アクセス</h3>
            <div className="aspect-video w-full rounded-lg bg-slate-800 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Google Maps</p>
              </div>
            </div>
          </Card> */}

          {/* 統計 */}
          <Card className="border-slate-800 bg-slate-900/50 p-4">
            <h3 className="font-semibold text-white mb-4">登録統計</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Users className="h-4 w-4" />
                  <span>在籍キャスト</span>
                </div>
                <span className="text-lg font-bold text-white">12名</span>
              </div>
              <Separator className="bg-slate-800" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>面接成約率</span>
                </div>
                <span className="text-lg font-bold text-emerald-400">75%</span>
              </div>
              <Separator className="bg-slate-800" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Star className="h-4 w-4" />
                  <span>人気度</span>
                </div>
                <span className="text-lg font-bold text-yellow-400">4.5/5</span>
              </div>
            </div>
          </Card>

          {/* クイックアクション */}
          <Link href="/casts/new">
            <Button className="w-full h-12" style={{ background: 'linear-gradient(135deg, #00C4CC 0%, #33D4DB 100%)' }}>
              この店舗にキャスト登録
            </Button>
          </Link>
        </TabsContent>

        {/* 分配率タブ（準備中） */}
        <TabsContent value="rate" className="mt-4">
          <Card className="border-slate-800 bg-slate-900/50 p-12 text-center">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400 text-sm">分配率計算は準備中です</p>
            <p className="text-xs text-slate-500 mt-2">
              店舗ごとの報酬計算・シミュレーション機能を実装予定
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
