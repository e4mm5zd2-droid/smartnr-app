'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Users,
  Building2,
  UserPlus,
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
          <div className="h-8 w-64 rounded bg-zinc-800" />
          <div className="h-64 rounded bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="space-y-4 p-4">
        <Card className="bg-zinc-900 p-12 text-center rounded-xl">
          <p className="text-zinc-400">店舗情報が見つかりませんでした</p>
          <Link href="/stores">
            <Button className="mt-4 bg-white text-zinc-950 hover:bg-zinc-200">
              一覧に戻る
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* ヘッダー */}
      <div className="bg-zinc-950 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Link href="/stores">
            <Button variant="ghost" size="icon" className="text-zinc-400">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{store.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-zinc-400" />
              <span className="text-sm text-zinc-400">{store.area}</span>
              <Badge variant="outline" className="ml-2 bg-white/10 text-white border-white/20">
                {store.system_type}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* タブ（画面上部） */}
      <Tabs defaultValue="info" className="flex-1 flex flex-col">
        <TabsList className="w-full bg-zinc-900 border-b border-zinc-800 rounded-none h-12">
          <TabsTrigger value="info" className="flex-1 data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
            基本情報
          </TabsTrigger>
          <TabsTrigger value="rate" className="flex-1 data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
            分配率
          </TabsTrigger>
        </TabsList>

        {/* 基本情報タブ */}
        <TabsContent value="info" className="flex-1 space-y-4 p-4 m-0">
          {/* 時給・年齢・業態・エリア */}
          <Card className="bg-zinc-900 p-5 rounded-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <DollarSign className="h-4 w-4" />
                  <span>時給</span>
                </div>
                <span className="font-semibold text-white">
                  ¥{store.hourly_wage_min?.toLocaleString()} - ¥{store.hourly_wage_max?.toLocaleString()}
                </span>
              </div>
              {store.target_age_min && store.target_age_max && (
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Users className="h-4 w-4" />
                    <span>対象年齢</span>
                  </div>
                  <span className="font-medium text-white">
                    {store.target_age_min}歳 - {store.target_age_max}歳
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <Building2 className="h-4 w-4" />
                  <span>業態</span>
                </div>
                <span className="font-medium text-white">{store.system_type}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>エリア</span>
                </div>
                <span className="font-medium text-white">{store.area}</span>
              </div>
            </div>
          </Card>

          {/* 説明 */}
          {store.description && (
            <Card className="bg-zinc-900 p-5 rounded-xl">
              <h3 className="font-semibold text-white mb-3">店舗詳細</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">{store.description}</p>
            </Card>
          )}

          {/* クイックアクション */}
          <Link href="/casts/new">
            <Button className="w-full h-12 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl">
              <UserPlus className="mr-2 h-5 w-5" />
              この店舗にキャスト登録
            </Button>
          </Link>
        </TabsContent>

        {/* 分配率タブ（準備中） */}
        <TabsContent value="rate" className="flex-1 p-4 m-0">
          <Card className="bg-zinc-900 p-12 text-center rounded-xl">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-400 text-sm">分配率計算は準備中です</p>
            <p className="text-xs text-zinc-500 mt-2">
              店舗ごとの報酬計算・シミュレーション機能を実装予定
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
