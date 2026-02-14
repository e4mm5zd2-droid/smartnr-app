'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Building2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Cast } from '@/lib/api';

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
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-slate-800" />
          <div className="h-64 rounded bg-slate-800" />
        </div>
      </div>
    );
  }

  if (!cast) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-slate-800 bg-slate-900/50 p-12 text-center">
          <p className="text-slate-400">キャスト情報が見つかりませんでした</p>
          <Link href="/casts">
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/casts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{cast.genji_name}</h1>
            <p className="mt-1 text-sm text-slate-400">キャスト詳細情報</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-700">
            <Edit className="mr-2 h-4 w-4" />
            編集
          </Button>
          <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
            <Trash2 className="mr-2 h-4 w-4" />
            削除
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* メイン情報 */}
        <Card className="border-slate-800 bg-slate-900/50 p-6 lg:col-span-2">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={cast.photos_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-2xl text-white">
                {cast.genji_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{cast.genji_name}</h2>
                <p className="text-slate-400">
                  {cast.real_name_initial ? `本名: ${cast.real_name_initial}` : '本名非公開'}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {cast.looks_tags?.map((tag, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="border-purple-500/30 bg-purple-500/10 text-purple-300"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <Separator className="bg-slate-800" />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300">{cast.age}歳</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <a href={`tel:${cast.phone}`} className="text-purple-400 hover:underline">
                    {cast.phone}
                  </a>
                </div>
                {cast.line_id && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">LINE: {cast.line_id}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-400">
                    登録日: {new Date(cast.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ステータスカード */}
        <Card className="border-slate-800 bg-slate-900/50 p-6">
          <h3 className="mb-4 font-semibold">ステータス</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">現在の状態</span>
              <Badge
                variant="outline"
                className="bg-green-500/10 text-green-400 border-green-500/20"
              >
                {cast.status}
              </Badge>
            </div>
            <Separator className="bg-slate-800" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">スカウトID</span>
              <span className="text-sm font-medium">
                {cast.scout_id || '-'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* アクション統計 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
              <Building2 className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">面接店舗数</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </div>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">総報酬額</p>
              <p className="text-2xl font-bold">¥150,000</p>
            </div>
          </div>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">成約率</p>
              <p className="text-2xl font-bold">66%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 面接履歴 */}
      <Card className="border-slate-800 bg-slate-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold">面接履歴</h3>
        <div className="space-y-3">
          <p className="text-sm text-slate-400">面接履歴がありません</p>
        </div>
      </Card>
    </div>
  );
}
