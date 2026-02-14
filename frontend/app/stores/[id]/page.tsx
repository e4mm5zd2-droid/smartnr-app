'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-slate-800" />
          <div className="h-64 rounded bg-slate-800" />
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container mx-auto p-6">
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
    <div className="container mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Link href="/stores">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{store.name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-400">{store.area}</span>
            <Badge variant="outline" className="ml-2 bg-purple-500/10 text-purple-400 border-purple-500/20">
              {store.system_type}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* メイン情報 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本情報カード */}
          <Card className="border-slate-800 bg-slate-900/50 p-6">
            <h2 className="mb-4 text-xl font-semibold">基本情報</h2>
            <Separator className="mb-4 bg-slate-800" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <DollarSign className="h-5 w-5" />
                  <span>時給</span>
                </div>
                <span className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ¥{store.hourly_wage_min.toLocaleString()} - ¥{store.hourly_wage_max.toLocaleString()}
                </span>
              </div>
              <Separator className="bg-slate-800" />
              {store.target_age_min && store.target_age_max && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users className="h-5 w-5" />
                      <span>対象年齢</span>
                    </div>
                    <span className="font-medium">
                      {store.target_age_min}歳 - {store.target_age_max}歳
                    </span>
                  </div>
                  <Separator className="bg-slate-800" />
                </>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Building2 className="h-5 w-5" />
                  <span>業態</span>
                </div>
                <span className="font-medium">{store.system_type}</span>
              </div>
              <Separator className="bg-slate-800" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="h-5 w-5" />
                  <span>エリア</span>
                </div>
                <span className="font-medium">{store.area}</span>
              </div>
            </div>
          </Card>

          {/* 説明 */}
          {store.description && (
            <Card className="border-slate-800 bg-slate-900/50 p-6">
              <h2 className="mb-4 text-xl font-semibold">店舗詳細</h2>
              <Separator className="mb-4 bg-slate-800" />
              <p className="text-slate-300 leading-relaxed">{store.description}</p>
            </Card>
          )}

          {/* Google Maps プレースホルダー */}
          <Card className="border-slate-800 bg-slate-900/50 p-6">
            <h2 className="mb-4 text-xl font-semibold">アクセス</h2>
            <Separator className="mb-4 bg-slate-800" />
            <div className="aspect-video w-full rounded-lg bg-slate-800 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Google Maps</p>
                <p className="text-xs text-slate-600 mt-1">実装予定: {store.area}周辺の地図</p>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-sm text-purple-300">
                📍 {store.area}
              </p>
            </div>
          </Card>
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* 統計カード */}
          <Card className="border-slate-800 bg-slate-900/50 p-6">
            <h3 className="mb-4 font-semibold">登録統計</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">在籍キャスト</p>
                  <p className="text-2xl font-bold">12名</p>
                </div>
              </div>
              <Separator className="bg-slate-800" />
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">面接成約率</p>
                  <p className="text-2xl font-bold">75%</p>
                </div>
              </div>
              <Separator className="bg-slate-800" />
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
                  <Star className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">人気度</p>
                  <p className="text-2xl font-bold">4.5/5</p>
                </div>
              </div>
            </div>
          </Card>

          {/* アクションボタン */}
          <Card className="border-slate-800 bg-slate-900/50 p-6">
            <h3 className="mb-4 font-semibold">クイックアクション</h3>
            <div className="space-y-3">
              <Link href="/casts/new">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  この店舗にキャスト登録
                </Button>
              </Link>
              <Button variant="outline" className="w-full border-slate-700">
                面接履歴を見る
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
