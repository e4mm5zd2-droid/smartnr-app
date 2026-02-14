'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Users, Store, TrendingUp, DollarSign, Sparkles, ArrowRight, Calendar } from 'lucide-react';
import { getCasts, getStores } from '@/lib/api';

export default function Home() {
  const [castsCount, setCastsCount] = useState(0);
  const [storesCount, setStoresCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [casts, stores] = await Promise.all([getCasts(), getStores()]);
        setCastsCount(casts.length);
        setStoresCount(stores.length);
      } catch (error) {
        console.error('データ取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* ウェルカムヘッダー */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 p-8" style={{ background: 'linear-gradient(135deg, rgba(0, 196, 204, 0.1) 0%, rgba(0, 196, 204, 0.05) 50%, rgba(0, 196, 204, 0.1) 100%)' }}>
        <div className="relative z-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm" style={{ backgroundColor: 'rgba(0, 196, 204, 0.2)', color: '#00C4CC' }}>
            <Sparkles className="h-4 w-4" />
            AI搭載スカウト管理システム
          </div>
          <h1 className="text-4xl font-bold">
            Welcome Back, <span style={{ color: '#00C4CC' }}>京極 蓮</span>
          </h1>
          <p className="mt-2 text-slate-400">
            今日も効率的なスカウト活動をサポートします
          </p>
        </div>
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(0, 196, 204, 0.2)' }} />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(0, 196, 204, 0.15)' }} />
      </div>

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #00C4CC 0%, #33D4DB 100%)' }}>
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-400">総キャスト数</p>
              <p className="text-3xl font-bold">{loading ? '--' : castsCount}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm">
            <TrendingUp className="h-3 w-3 text-green-400" />
            <span className="text-green-400">+12%</span>
            <span className="text-slate-500">vs 先月</span>
          </div>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-orange-500">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-400">提携店舗</p>
              <p className="text-3xl font-bold">{loading ? '--' : storesCount}</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            京都エリア中心
          </div>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-400">今月成約</p>
              <p className="text-3xl font-bold">28</p>
            </div>
          </div>
          <div className="mt-4 text-sm">
            成約率 <span className="font-semibold text-green-400">67%</span>
          </div>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-400">報酬見込み</p>
              <p className="text-3xl font-bold">¥420k</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            今月の総額
          </div>
        </Card>
      </div>

      {/* クイックアクション */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/casts/new">
          <Card className="group border-slate-800 p-6 transition-all cursor-pointer" 
            style={{ background: 'linear-gradient(135deg, rgba(0, 196, 204, 0.1) 0%, rgba(0, 196, 204, 0.05) 100%)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 196, 204, 0.5)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 196, 204, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgb(30 41 59)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <UserPlus className="h-8 w-8 mb-3" style={{ color: '#00C4CC' }} />
            <h3 className="font-semibold text-lg">新規登録</h3>
            <p className="text-sm text-slate-400 mt-1">AI分析で登録</p>
            <ArrowRight className="h-4 w-4 mt-4 group-hover:translate-x-1 transition-transform" style={{ color: '#00C4CC' }} />
          </Card>
        </Link>

        <Link href="/casts">
          <Card className="group border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-slate-700 hover:bg-slate-800/50 cursor-pointer">
            <Users className="h-8 w-8 text-slate-400 mb-3" />
            <h3 className="font-semibold text-lg">キャスト一覧</h3>
            <p className="text-sm text-slate-400 mt-1">登録者の検索・管理</p>
            <ArrowRight className="h-4 w-4 text-slate-400 mt-4 group-hover:translate-x-1 transition-transform" />
          </Card>
        </Link>

        <Link href="/stores">
          <Card className="group border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-slate-700 hover:bg-slate-800/50 cursor-pointer">
            <Store className="h-8 w-8 text-slate-400 mb-3" />
            <h3 className="font-semibold text-lg">店舗管理</h3>
            <p className="text-sm text-slate-400 mt-1">提携店舗の詳細情報</p>
            <ArrowRight className="h-4 w-4 text-slate-400 mt-4 group-hover:translate-x-1 transition-transform" />
          </Card>
        </Link>

        <Link href="/salary">
          <Card className="group border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-slate-700 hover:bg-slate-800/50 cursor-pointer">
            <DollarSign className="h-8 w-8 text-slate-400 mb-3" />
            <h3 className="font-semibold text-lg">給料申請</h3>
            <p className="text-sm text-slate-400 mt-1">報酬の申請・管理</p>
            <Badge variant="outline" className="mt-4" style={{ borderColor: 'rgba(0, 196, 204, 0.3)', backgroundColor: 'rgba(0, 196, 204, 0.1)', color: '#00C4CC' }}>New</Badge>
          </Card>
        </Link>
      </div>

      {/* 最近の活動 */}
      <Card className="border-slate-800 bg-slate-900/50">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">最近の活動</h2>
              <p className="text-sm text-slate-400 mt-1">直近の登録・マッチング状況</p>
            </div>
            <Link href="/casts">
              <Button variant="ghost" size="sm">
                すべて見る
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {[
            { id: 1, name: 'あやか', action: '面接完了', shop: 'Club LION', time: '2時間前', status: 'success' },
            { id: 2, name: 'みゆき', action: 'AI分析完了', shop: 'PLATINUM', time: '5時間前', status: 'info' },
            { id: 3, name: 'さくら', action: '新規登録', shop: '-', time: '1日前', status: 'pending' },
          ].map((activity) => (
            <Link
              key={activity.id}
              href={`/casts/${activity.id}`}
              className="block"
            >
              <div className="flex items-center justify-between rounded-lg p-4 transition-all hover:bg-slate-800/50 cursor-pointer hover:border hover:border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #00C4CC 0%, #33D4DB 100%)' }}>
                    {activity.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{activity.name}</p>
                    <p className="text-sm text-slate-400">{activity.action} · {activity.shop}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" />
                    {activity.time}
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      activity.status === 'success'
                        ? 'border-green-500/30 bg-green-500/10 text-green-400'
                        : activity.status === 'info'
                        ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                        : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                    }
                  >
                    {activity.status === 'success' ? '完了' : activity.status === 'info' ? '処理中' : '保留'}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
