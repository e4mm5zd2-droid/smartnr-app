'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCasts, Cast } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  UserPlus,
  Search,
  Filter,
  Eye,
  Phone,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ExportMenu } from '@/components/export-menu';
import { CastCategoryBadge, type CastCategory } from '@/components/cast-category-badge';

const statusConfig = {
  active: { label: '活動中', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  inactive: { label: '休止中', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  pending: { label: '審査中', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  working: { label: '勤務中', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
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
    
    // カテゴリフィルター適用
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((cast) => cast.cast_category === categoryFilter);
    }
    
    setFilteredCasts(filtered);
  }, [searchQuery, categoryFilter, casts]);

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
          <h1 className="text-3xl font-bold">キャスト管理</h1>
          <p className="mt-1 text-sm text-slate-400">
            登録されているキャストの一覧と管理
          </p>
        </div>
        <Link href="/casts/new">
          <Button 
            className="text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #00C4CC 0%, #33D4DB 100%)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #00A3AA 0%, #00C4CC 100%)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #00C4CC 0%, #33D4DB 100%)')}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            新規登録
          </Button>
        </Link>
      </div>

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: '総キャスト数', value: casts.length, color: 'from-purple-500 to-pink-500' },
          { label: '活動中', value: casts.filter(c => c.status === 'active').length, color: 'from-green-500 to-emerald-500' },
          { label: '審査中', value: casts.filter(c => c.status === 'pending').length, color: 'from-yellow-500 to-orange-500' },
          { label: '勤務中', value: casts.filter(c => c.status === 'working').length, color: 'from-blue-500 to-cyan-500' },
        ].map((stat, idx) => (
          <Card key={idx} className="border-slate-800 bg-slate-900/50 p-4">
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className={`mt-2 text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {loading ? '---' : stat.value}
            </p>
          </Card>
        ))}
      </div>

      {/* 検索・フィルター */}
      <Card className="border-slate-800 bg-slate-900/50 p-4">
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="源氏名・電話番号で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-800 pl-10"
              />
            </div>
            <ExportMenu data={filteredCasts} type="casts" />
          </div>
          
          {/* カテゴリフィルター */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-400">カテゴリ:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCategoryFilter('all')}
              className={`${categoryFilter === 'all' ? 'bg-[#00C4CC]/20 text-[#00C4CC] border-[#00C4CC]' : 'border-slate-700'}`}
            >
              全て
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCategoryFilter('new')}
              className={`${categoryFilter === 'new' ? 'bg-red-500/20 text-red-400 border-red-500' : 'border-slate-700'}`}
            >
              🆕 新人
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCategoryFilter('experience')}
              className={`${categoryFilter === 'experience' ? 'bg-[#00C4CC]/20 text-[#00C4CC] border-[#00C4CC]' : 'border-slate-700'}`}
            >
              👩 経験あり
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCategoryFilter('active')}
              className={`${categoryFilter === 'active' ? 'bg-green-500/20 text-green-400 border-green-500' : 'border-slate-700'}`}
            >
              🟢 稼働中
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCategoryFilter('returner')}
              className={`${categoryFilter === 'returner' ? 'bg-orange-500/20 text-orange-400 border-orange-500' : 'border-slate-700'}`}
            >
              🔄 復帰
            </Button>
          </div>
        </div>
      </Card>

      {/* テーブル */}
      <Card className="border-slate-800 bg-slate-900/50">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-slate-800/50">
              <TableHead>源氏名</TableHead>
              <TableHead>カテゴリ</TableHead>
              <TableHead>年齢</TableHead>
              <TableHead>電話番号</TableHead>
              <TableHead>タグ</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>登録日</TableHead>
              <TableHead className="text-right">アクション</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="border-slate-800">
                  <TableCell colSpan={7}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredCasts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-400">
                  {searchQuery ? '検索結果がありません' : 'まだキャストが登録されていません'}
                </TableCell>
              </TableRow>
            ) : (
              filteredCasts.map((cast) => (
                <TableRow
                  key={cast.id}
                  className="border-slate-800 hover:bg-slate-800/50"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span>{cast.genji_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <CastCategoryBadge category={(cast.cast_category || 'new') as CastCategory} />
                  </TableCell>
                  <TableCell>{cast.age}歳</TableCell>
                  <TableCell>
                    <a
                      href={`tel:${cast.phone}`}
                      className="flex items-center gap-1 text-purple-400 hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {cast.phone}
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {cast.looks_tags?.slice(0, 2).map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        style={{ borderColor: 'rgba(0, 196, 204, 0.3)', backgroundColor: 'rgba(0, 196, 204, 0.1)', color: '#33D4DB' }}
                      >
                        {tag}
                      </Badge>
                      )) || <span className="text-slate-500 text-xs">-</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusConfig[cast.status as keyof typeof statusConfig]?.color || statusConfig.inactive.color}
                    >
                      {statusConfig[cast.status as keyof typeof statusConfig]?.label || cast.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(cast.created_at).toLocaleDateString('ja-JP')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/casts/${cast.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
