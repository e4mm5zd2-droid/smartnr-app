'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Edit,
  Trash2,
  Building2,
  DollarSign,
  TrendingUp,
  UserCircle2,
} from 'lucide-react';
import { Cast } from '@/lib/api';
import { CastCategoryBadge, type CastCategory } from '@/components/cast-category-badge';

export default function CastDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [cast, setCast] = useState<Cast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCast = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/job-seekers/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setCast(data);
      } catch (error) {
        console.error('キャスト詳細取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCast();
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

  if (!cast) {
    return (
      <div className="space-y-4 p-4">
        <Card className="bg-zinc-900 p-12 text-center rounded-xl">
          <p className="text-zinc-400">キャスト情報が見つかりませんでした</p>
          <Link href="/casts">
            <Button className="mt-4 bg-white text-zinc-950 hover:bg-zinc-200">
              一覧に戻る
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/casts">
            <Button variant="ghost" size="icon" className="text-zinc-400">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3 text-white">
              {cast.genji_name}
              <CastCategoryBadge category={(cast.cast_category || 'new') as CastCategory} />
            </h1>
            <p className="mt-1 text-sm text-zinc-400">キャスト詳細情報</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="bg-zinc-800 text-white hover:bg-zinc-700">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" className="text-red-400 hover:bg-red-500/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* メイン情報 */}
      <Card className="bg-zinc-900 p-5 rounded-xl">
        <div className="flex items-start gap-4">
          <UserCircle2 className="h-20 w-20 flex-shrink-0 text-zinc-500" />
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white">{cast.genji_name}</h2>
              <p className="text-zinc-400 text-sm">
                {cast.real_name_initial ? `本名: ${cast.real_name_initial}` : '本名非公開'}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {cast.looks_tags?.map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-zinc-800 text-zinc-300 border-none text-xs"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-zinc-400" />
                <span className="text-white">{cast.age}歳</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-zinc-400" />
                <a href={`tel:${cast.phone}`} className="text-white hover:underline">
                  {cast.phone}
                </a>
              </div>
              {cast.line_id && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-zinc-400" />
                  <span className="text-zinc-300">LINE: {cast.line_id}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-zinc-400" />
                <span className="text-zinc-400">
                  登録日: {new Date(cast.created_at).toLocaleDateString('ja-JP')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 統計 */}
      <div className="grid gap-3 grid-cols-3">
        <Card className="bg-zinc-900 p-4 rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <Building2 className="h-6 w-6 text-zinc-400" />
            <div className="text-center">
              <p className="text-xs text-zinc-500">面接店舗</p>
              <p className="text-xl font-bold text-white">3</p>
            </div>
          </div>
        </Card>
        <Card className="bg-zinc-900 p-4 rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <DollarSign className="h-6 w-6 text-emerald-400" />
            <div className="text-center">
              <p className="text-xs text-zinc-500">総報酬</p>
              <p className="text-xl font-bold text-white">¥150k</p>
            </div>
          </div>
        </Card>
        <Card className="bg-zinc-900 p-4 rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-400" />
            <div className="text-center">
              <p className="text-xs text-zinc-500">成約率</p>
              <p className="text-xl font-bold text-white">66%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 面接履歴 */}
      <Card className="bg-zinc-900 p-5 rounded-xl">
        <h3 className="mb-4 text-lg font-semibold text-white">面接履歴</h3>
        <p className="text-sm text-zinc-400">面接履歴がありません</p>
      </Card>
    </div>
  );
}
