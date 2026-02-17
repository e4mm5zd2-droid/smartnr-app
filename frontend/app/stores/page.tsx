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
  Eye,
  ChevronRight,
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
    キャバクラ: { label: 'キャバクラ', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    ガールズバー: { label: 'ガールズバー', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
    ラウンジ: { label: 'ラウンジ', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  };

  return (
    <div className="space-y-6 p-4">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-white">店舗</h1>
      </div>

      {/* 検索 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          placeholder="店舗名・エリアで検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-zinc-900 border-none pl-10 h-12 rounded-xl focus:ring-1 focus:ring-zinc-600"
        />
      </div>

      {/* 店舗リスト（X風） */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <Card key={idx} className="bg-zinc-900 p-4 rounded-xl">
              <Skeleton className="h-16 w-full" />
            </Card>
          ))
        ) : filteredStores.length === 0 ? (
          <Card className="bg-zinc-900 p-8 text-center rounded-xl">
            <p className="text-zinc-400">
              {searchQuery ? '検索結果がありません' : '店舗がありません'}
            </p>
          </Card>
        ) : (
          filteredStores.map((store) => (
            <Link key={store.id} href={`/stores/${store.id}`}>
              <Card className="bg-zinc-900 p-4 hover:bg-zinc-800 transition-colors cursor-pointer rounded-xl">
                <div className="flex items-start gap-3">
                  {/* アイコン */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                    <Store className="h-5 w-5 text-zinc-400" />
                  </div>

                  {/* 本文 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{store.name}</h3>
                      <Badge
                        variant="outline"
                        className={systemTypeConfig[store.system_type]?.color || 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'}
                      >
                        {store.system_type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                      <MapPin className="h-3 w-3" />
                      {store.area}
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-zinc-400">
                        時給: <span className="text-white font-medium">¥{store.hourly_wage_min.toLocaleString()} - ¥{store.hourly_wage_max.toLocaleString()}</span>
                      </span>
                      {store.target_age_min && store.target_age_max && (
                        <span className="text-zinc-400">
                          対象: {store.target_age_min}歳-{store.target_age_max}歳
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 右矢印 */}
                  <ChevronRight className="h-5 w-5 flex-shrink-0 text-zinc-500" />
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* 件数表示 */}
      {!loading && filteredStores.length > 0 && (
        <p className="text-center text-sm text-zinc-500">
          {filteredStores.length}件の店舗
        </p>
      )}
    </div>
  );
}
