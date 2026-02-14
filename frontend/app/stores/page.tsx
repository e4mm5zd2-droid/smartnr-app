'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStores } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Store,
  Search,
  MapPin,
  DollarSign,
  Users,
  Eye,
  ArrowLeft,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function StoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [filteredStores, setFilteredStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await getStores();
        setStores(data);
        setFilteredStores(data);
      } catch (error) {
        console.error('店舗取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  useEffect(() => {
    const filtered = stores.filter((store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.area.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStores(filtered);
  }, [searchQuery, stores]);

  const systemTypeConfig: Record<string, { label: string; color: string }> = {
    キャバクラ: { label: 'キャバクラ', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    ガールズバー: { label: 'ガールズバー', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
    ラウンジ: { label: 'ラウンジ', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 戻るリンク */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">ダッシュボードに戻る</span>
      </Link>

      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">店舗管理</h1>
          <p className="mt-1 text-sm text-slate-400">
            提携店舗の一覧と詳細情報
          </p>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: '総店舗数', value: stores.length, color: 'from-purple-500 to-pink-500', icon: Store },
          { label: '平均時給', value: stores.length > 0 ? `¥${Math.round(stores.reduce((sum, s) => sum + (s.hourly_wage_min + s.hourly_wage_max) / 2, 0) / stores.length)}` : '-', color: 'from-green-500 to-emerald-500', icon: DollarSign },
          { label: '京都エリア', value: stores.filter(s => s.area.includes('京都')).length, color: 'from-yellow-500 to-orange-500', icon: MapPin },
          { label: '登録キャスト', value: 42, color: 'from-blue-500 to-cyan-500', icon: Users },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="border-slate-800 bg-slate-900/50 p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold">
                    {loading ? '---' : stat.value}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 検索 */}
      <Card className="border-slate-800 bg-slate-900/50 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="店舗名・エリアで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-800 pl-10"
          />
        </div>
      </Card>

      {/* 店舗カード一覧 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="border-slate-800 bg-slate-900/50 p-6">
              <Skeleton className="h-32 w-full" />
            </Card>
          ))
        ) : filteredStores.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-400">
              {searchQuery ? '検索結果がありません' : '店舗がありません'}
            </p>
          </div>
        ) : (
          filteredStores.map((store) => (
            <Link key={store.id} href={`/stores/${store.id}`}>
              <Card className="border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{store.name}</h3>
                      <div className="mt-1 flex items-center gap-1 text-sm text-slate-400">
                        <MapPin className="h-3 w-3" />
                        {store.area}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={systemTypeConfig[store.system_type]?.color || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}
                    >
                      {store.system_type}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">時給</span>
                      <span className="font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        ¥{store.hourly_wage_min.toLocaleString()} - ¥{store.hourly_wage_max.toLocaleString()}
                      </span>
                    </div>
                    {store.target_age_min && store.target_age_max && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">対象年齢</span>
                        <span className="text-slate-300">
                          {store.target_age_min}歳 - {store.target_age_max}歳
                        </span>
                      </div>
                    )}
                  </div>

                  {store.description && (
                    <p className="text-sm text-slate-400 line-clamp-2">
                      {store.description}
                    </p>
                  )}

                  <Button
                    variant="outline"
                    className="w-full border-slate-700 hover:border-purple-500/50"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    詳細を見る
                  </Button>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
