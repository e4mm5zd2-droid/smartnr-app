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
  Clock,
  CreditCard,
  Shield,
  Shirt,
  LayoutGrid,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Car,
  Home,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';

interface RawInfo {
  都道府県?: string;
  エリア?: string;
  住所?: string;
  系列店?: string;
  営業時間?: string;
  身分証?: string;
  衣装?: string;
  卓数?: string;
  年齢シフト?: string;
  給与システム?: string;
  採用時給?: string;
  給料日?: string;
  バック類?: string;
  引かれもの?: string;
  ノルマペナルティ?: string;
  送り?: string;
  客層?: string;
  寮?: string;
  詳細条件?: Record<string, boolean>;
  source_url?: string;
}

function InfoRow({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-zinc-800 last:border-0">
      <div className="flex items-center gap-2 text-zinc-400 text-sm shrink-0 min-w-[100px]">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-sm text-white text-right whitespace-pre-line">{value}</span>
    </div>
  );
}

function ConditionBadge({ label, value }: { label: string; value: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
      value
        ? 'bg-zinc-700/50 border-zinc-600 text-white'
        : 'bg-zinc-900 border-zinc-800 text-zinc-600'
    }`}>
      {value
        ? <CheckCircle2 className="h-3.5 w-3.5 text-zinc-300" />
        : <XCircle className="h-3.5 w-3.5 text-zinc-700" />
      }
      {label}
    </div>
  );
}

export default function StoreDetailPage() {
  const params = useParams();
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        // Supabase直接クエリ（raw_infoを含む全フィールドを取得）
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey) {
          const res = await fetch(
            `${supabaseUrl}/rest/v1/shops?id=eq.${params.id}&select=*`,
            {
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              setStore(data[0]);
              return;
            }
          }
        }

        // フォールバック: バックエンドAPI
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://smartnr-backend.onrender.com'}/api/stores/${params.id}`
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

  const raw: RawInfo = store.raw_info || {};
  const conditions = raw.詳細条件 || {};

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* ヘッダー */}
      <div className="bg-zinc-950 p-4 space-y-3 sticky top-0 z-10 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Link href="/stores">
            <Button variant="ghost" size="icon" className="text-zinc-400">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white truncate">{store.name}</h1>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-xs text-zinc-400">{raw.都道府県} {store.area}</span>
              </div>
              <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-xs">
                {store.system_type}
              </Badge>
              {store.hiring_status === 'active' && (
                <Badge className="bg-zinc-700 text-white text-xs">採用中</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* タブ */}
      <Tabs defaultValue="info" className="flex-1 flex flex-col">
        <TabsList className="w-full bg-zinc-900 border-b border-zinc-800 rounded-none h-12 shrink-0">
          <TabsTrigger value="info" className="flex-1 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-xs">
            基本情報
          </TabsTrigger>
          <TabsTrigger value="pay" className="flex-1 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-xs">
            給与・バック
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex-1 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-xs">
            ルール・条件
          </TabsTrigger>
        </TabsList>

        {/* ─── 基本情報タブ ─── */}
        <TabsContent value="info" className="flex-1 space-y-4 p-4 m-0">
          {/* 時給・採用情報カード */}
          <Card className="bg-zinc-900 p-5 rounded-xl">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">採用情報</h3>
            <div className="space-y-0">
              <InfoRow label="採用時給" value={raw.採用時給} icon={<DollarSign className="h-4 w-4" />} />
              <InfoRow label="対象年齢" value={raw.年齢シフト} icon={<Users className="h-4 w-4" />} />
              <InfoRow label="給与方式" value={raw.給与システム} icon={<TrendingUp className="h-4 w-4" />} />
              <InfoRow label="給料日" value={raw.給料日} icon={<Calendar className="h-4 w-4" />} />
            </div>
          </Card>

          {/* 店舗情報カード */}
          <Card className="bg-zinc-900 p-5 rounded-xl">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">店舗情報</h3>
            <div className="space-y-0">
              <InfoRow label="エリア" value={raw.都道府県 ? `${raw.都道府県} ${raw.エリア || ''}` : store.area} icon={<MapPin className="h-4 w-4" />} />
              <InfoRow label="住所" value={raw.住所} icon={<Building2 className="h-4 w-4" />} />
              <InfoRow label="営業時間" value={raw.営業時間} icon={<Clock className="h-4 w-4" />} />
              <InfoRow label="卓数" value={raw.卓数} icon={<LayoutGrid className="h-4 w-4" />} />
              <InfoRow label="客層" value={raw.客層} icon={<Users className="h-4 w-4" />} />
              <InfoRow label="系列店" value={raw.系列店} icon={<Building2 className="h-4 w-4" />} />
            </div>
          </Card>

          {/* 入店条件カード */}
          <Card className="bg-zinc-900 p-5 rounded-xl">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">入店条件</h3>
            <div className="space-y-0">
              <InfoRow label="身分証" value={raw.身分証} icon={<Shield className="h-4 w-4" />} />
              <InfoRow label="衣装" value={raw.衣装} icon={<Shirt className="h-4 w-4" />} />
              <InfoRow label="寮" value={raw.寮} icon={<Home className="h-4 w-4" />} />
            </div>
          </Card>

          {/* 詳細条件バッジ */}
          {Object.keys(conditions).length > 0 && (
            <Card className="bg-zinc-900 p-5 rounded-xl">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">詳細条件</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(conditions).map(([key, val]) => (
                  <ConditionBadge key={key} label={key} value={val as boolean} />
                ))}
              </div>
            </Card>
          )}

          {/* クイックアクション */}
          <Link href="/casts/new">
            <Button className="w-full h-12 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl">
              <UserPlus className="mr-2 h-5 w-5" />
              この店舗にキャスト登録
            </Button>
          </Link>

          {/* 情報元リンク */}
          {raw.source_url && (
            <a href={raw.source_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full h-10 border-zinc-700 text-zinc-400 hover:text-white text-xs">
                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                sn-offer.com で詳細を確認
              </Button>
            </a>
          )}
        </TabsContent>

        {/* ─── 給与・バックタブ ─── */}
        <TabsContent value="pay" className="flex-1 space-y-4 p-4 m-0">
          {raw.バック類 ? (
            <Card className="bg-zinc-900 p-5 rounded-xl">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">バック類</h3>
              <p className="text-sm text-zinc-300 whitespace-pre-line leading-relaxed">{raw.バック類}</p>
            </Card>
          ) : (
            <Card className="bg-zinc-900 p-8 text-center rounded-xl">
              <DollarSign className="h-10 w-10 mx-auto mb-3 text-zinc-700" />
              <p className="text-zinc-500 text-sm">バック情報は非公開です</p>
            </Card>
          )}

          {raw.引かれもの && (
            <Card className="bg-zinc-900 p-5 rounded-xl">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">引かれもの</h3>
              <p className="text-sm text-zinc-300 whitespace-pre-line leading-relaxed">{raw.引かれもの}</p>
            </Card>
          )}

          <Card className="bg-zinc-900 p-5 rounded-xl">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">給与まとめ</h3>
            <div className="space-y-0">
              <InfoRow label="採用時給" value={raw.採用時給} icon={<DollarSign className="h-4 w-4" />} />
              <InfoRow label="給与方式" value={raw.給与システム} icon={<TrendingUp className="h-4 w-4" />} />
              <InfoRow label="給料日" value={raw.給料日} icon={<Calendar className="h-4 w-4" />} />
            </div>
          </Card>
        </TabsContent>

        {/* ─── ルール・条件タブ ─── */}
        <TabsContent value="rules" className="flex-1 space-y-4 p-4 m-0">
          {raw.ノルマペナルティ && (
            <Card className="bg-zinc-900 p-5 rounded-xl">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5" />
                ノルマ・ペナルティ
              </h3>
              <p className="text-sm text-zinc-300 whitespace-pre-line leading-relaxed">{raw.ノルマペナルティ}</p>
            </Card>
          )}

          {raw.送り && (
            <Card className="bg-zinc-900 p-5 rounded-xl">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Car className="h-3.5 w-3.5" />
                送りについて
              </h3>
              <p className="text-sm text-zinc-300 whitespace-pre-line leading-relaxed">{raw.送り}</p>
            </Card>
          )}

          <Card className="bg-zinc-900 p-5 rounded-xl">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">入店条件</h3>
            <div className="space-y-0">
              <InfoRow label="身分証" value={raw.身分証} icon={<Shield className="h-4 w-4" />} />
              <InfoRow label="衣装" value={raw.衣装} icon={<Shirt className="h-4 w-4" />} />
              <InfoRow label="寮" value={raw.寮} icon={<Home className="h-4 w-4" />} />
            </div>
          </Card>

          {Object.keys(conditions).length > 0 && (
            <Card className="bg-zinc-900 p-5 rounded-xl">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">詳細条件</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(conditions).map(([key, val]) => (
                  <ConditionBadge key={key} label={key} value={val as boolean} />
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
