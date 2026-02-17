'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCasts, Cast } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { UserCircle2, Search, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CastCategoryBadge, type CastCategory } from '@/components/cast-category-badge';

const statusConfig = {
  active: { label: '稼働中', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', emoji: '🟢' },
  inactive: { label: '休止中', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', emoji: '⚫' },
  pending: { label: '面談中', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', emoji: '🟡' },
  working: { label: '体入中', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', emoji: '🔵' },
};

type CastCategoryFilter = 'all' | CastCategory;

export default function CastsPage() {
  const [casts, setCasts] = useState<Cast[]>([]);
  const [filteredCasts, setFilteredCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CastCategoryFilter>('all');

  useEffect(() => {
    const fetchCasts = async () => {
      try {
        const data = await getCasts();
        setCasts(data);
        setFilteredCasts(data);
      } catch (error) {
        console.error('キャスト取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCasts();
  }, []);

  useEffect(() => {
    let filtered = casts.filter((cast) =>
      cast.genji_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cast.phone.includes(searchQuery)
    );
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((cast) => cast.cast_category === categoryFilter);
    }
    
    setFilteredCasts(filtered);
  }, [searchQuery, categoryFilter, casts]);

  return (
    <div className="space-y-4 p-4">
      {/* 検索バー */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="キャストを検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-slate-900/50 border-slate-800 pl-10 h-12"
        />
      </div>

      {/* フィルタータブ（横スクロール） */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCategoryFilter('all')}
          className={`flex-shrink-0 ${categoryFilter === 'all' ? 'bg-[#00C4CC]/20 text-[#00C4CC] border-[#00C4CC]' : 'border-slate-700 bg-slate-900/50'}`}
        >
          全て
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCategoryFilter('new')}
          className={`flex-shrink-0 ${categoryFilter === 'new' ? 'bg-red-500/20 text-red-400 border-red-500' : 'border-slate-700 bg-slate-900/50'}`}
        >
          🆕 新人
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCategoryFilter('experience')}
          className={`flex-shrink-0 ${categoryFilter === 'experience' ? 'bg-[#00C4CC]/20 text-[#00C4CC] border-[#00C4CC]' : 'border-slate-700 bg-slate-900/50'}`}
        >
          👩 経験あり
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCategoryFilter('active')}
          className={`flex-shrink-0 ${categoryFilter === 'active' ? 'bg-green-500/20 text-green-400 border-green-500' : 'border-slate-700 bg-slate-900/50'}`}
        >
          🟢 稼働中
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCategoryFilter('returner')}
          className={`flex-shrink-0 ${categoryFilter === 'returner' ? 'bg-orange-500/20 text-orange-400 border-orange-500' : 'border-slate-700 bg-slate-900/50'}`}
        >
          🔄 復帰
        </Button>
      </div>

      {/* キャストリスト（X風） */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <Card key={idx} className="border-slate-800 bg-slate-900/50 p-4">
              <Skeleton className="h-16 w-full" />
            </Card>
          ))
        ) : filteredCasts.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900/50 p-8 text-center">
            <p className="text-slate-400">
              {searchQuery ? '検索結果がありません' : 'まだキャストが登録されていません'}
            </p>
          </Card>
        ) : (
          filteredCasts.map((cast) => (
            <Link key={cast.id} href={`/casts/${cast.id}`}>
              <Card className="border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800/50 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  {/* アバター（写真削除 → デフォルトアイコン） */}
                  <UserCircle2 className="h-12 w-12 flex-shrink-0 text-slate-500" />

                  {/* 本文 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{cast.genji_name}</span>
                      <span className="text-sm text-slate-400">{cast.age}歳</span>
                      <CastCategoryBadge category={(cast.cast_category || 'new') as CastCategory} />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {/* ルックスタグ */}
                      {cast.looks_tags?.slice(0, 3).map((tag, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-xs border-slate-700 bg-slate-800/50 text-slate-300"
                        >
                          {tag}
                        </Badge>
                      ))}
                      
                      {/* ステータス */}
                      <Badge
                        variant="outline"
                        className={`text-xs ${statusConfig[cast.status as keyof typeof statusConfig]?.color || statusConfig.inactive.color}`}
                      >
                        {statusConfig[cast.status as keyof typeof statusConfig]?.emoji} {statusConfig[cast.status as keyof typeof statusConfig]?.label || cast.status}
                      </Badge>
                    </div>
                  </div>

                  {/* 右矢印 */}
                  <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-500" />
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* 件数表示 */}
      {!loading && filteredCasts.length > 0 && (
        <p className="text-center text-sm text-slate-500">
          {filteredCasts.length}件のキャスト
        </p>
      )}
    </div>
  );
}
