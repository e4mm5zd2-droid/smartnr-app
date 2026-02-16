'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/tracking/StatCard';
import { FunnelBar } from '@/components/tracking/FunnelBar';
import { ConversionCard } from '@/components/tracking/ConversionCard';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface DashboardData {
  recruit: {
    total_links: number;
    total_clicks: number;
    total_submissions: number;
    total_hired: number;
    total_sb: number;
    unpaid_sb: number;
    cvr: number;
    funnel: {
      submitted: number;
      contacted: number;
      interviewed: number;
      trial: number;
      hired: number;
      active: number;
    };
    recent_conversions: Array<{
      id: number;
      applicant_name: string;
      applicant_age: number | null;
      shop_name: string | null;
      status: string;
      created_at: string;
    }>;
  };
  app_invite: {
    total_links: number;
    total_clicks: number;
    total_submissions: number;
    cvr: number;
    funnel: {
      submitted: number;
      registered: number;
      active: number;
      churned: number;
    };
  };
}

export default function ScoutTrackingPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'https://smartnr-backend.onrender.com';
  const SCOUT_ID = 1; // TODO: Supabaseから実際のスカウトIDを取得

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/links/dashboard?scout_id=${SCOUT_ID}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-slate-400">読み込み中...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-slate-400">データが取得できませんでした</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🔗</div>
          <h1 className="text-3xl font-bold text-white">紹介トラッキング</h1>
        </div>
      </div>

      {/* タブ */}
      <Tabs defaultValue="recruit" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800">
          <TabsTrigger value="recruit">🌙 キャスト募集</TabsTrigger>
          <TabsTrigger value="app">💎 アプリ紹介</TabsTrigger>
        </TabsList>

        {/* キャスト募集タブ */}
        <TabsContent value="recruit" className="space-y-6">
          {/* 統計カード */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="リンク" value={data.recruit.total_links} />
            <StatCard title="クリック" value={data.recruit.total_clicks} />
            <StatCard title="応募" value={data.recruit.total_submissions} />
            <StatCard title="SB" value={`¥${Math.floor(data.recruit.total_sb / 10000)}万`} accent="#00C4CC" />
          </div>

          {/* ファネル */}
          <Card className="border-slate-700 bg-slate-900/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4">📊 ファネル</h3>
            <FunnelBar
              label="クリック"
              value={data.recruit.total_clicks}
              max={data.recruit.total_clicks}
              color="#00C4CC"
            />
            <FunnelBar
              label="応募"
              value={data.recruit.funnel.submitted}
              max={data.recruit.total_clicks}
              color="#00C4CC"
            />
            <FunnelBar
              label="面接"
              value={data.recruit.funnel.interviewed}
              max={data.recruit.total_clicks}
              color="#00C4CC"
            />
            <FunnelBar label="体入" value={data.recruit.funnel.trial} max={data.recruit.total_clicks} color="#00C4CC" />
            <FunnelBar label="採用" value={data.recruit.funnel.hired} max={data.recruit.total_clicks} color="#00C4CC" />
            <FunnelBar
              label="稼働中"
              value={data.recruit.funnel.active}
              max={data.recruit.total_clicks}
              color="#00C4CC"
            />
            <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between text-sm">
              <span className="text-slate-400">
                CVR: <span className="text-[#00C4CC] font-bold">{data.recruit.cvr}%</span>
              </span>
              <span className="text-slate-400">
                💰 未払いSB: <span className="text-[#FF6B6B] font-bold">¥{data.recruit.unpaid_sb.toLocaleString()}</span>
              </span>
            </div>
          </Card>

          {/* リンク作成ボタン */}
          <Link href="/tracking/new?type=recruit">
            <Button className="w-full" size="lg">
              <Plus className="h-5 w-5 mr-2" />
              募集リンクを作成
            </Button>
          </Link>

          {/* 最近の応募 */}
          <Card className="border-slate-700 bg-slate-900/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">📋 最近の応募</h3>
              <Link href="/tracking/conversions?type=recruit">
                <Button variant="ghost" size="sm">
                  全て見る →
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {data.recruit.recent_conversions.length > 0 ? (
                data.recruit.recent_conversions.map((conv) => (
                  <ConversionCard
                    key={conv.id}
                    id={conv.id}
                    applicantName={conv.applicant_name}
                    applicantAge={conv.applicant_age || undefined}
                    linkType="recruit"
                    shopName={conv.shop_name || undefined}
                    status={conv.status}
                    createdAt={conv.created_at}
                  />
                ))
              ) : (
                <p className="text-center text-slate-400 py-8">まだ応募がありません</p>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* アプリ紹介タブ */}
        <TabsContent value="app" className="space-y-6">
          {/* 統計カード */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard title="リンク" value={data.app_invite.total_links} />
            <StatCard title="クリック" value={data.app_invite.total_clicks} />
            <StatCard title="登録" value={data.app_invite.total_submissions} accent="#FF69B4" />
          </div>

          {/* ファネル */}
          <Card className="border-slate-700 bg-slate-900/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4">📊 ファネル</h3>
            <FunnelBar
              label="クリック"
              value={data.app_invite.total_clicks}
              max={data.app_invite.total_clicks}
              color="#FF69B4"
            />
            <FunnelBar
              label="登録"
              value={data.app_invite.funnel.submitted}
              max={data.app_invite.total_clicks}
              color="#FF69B4"
            />
            <FunnelBar
              label="利用中"
              value={data.app_invite.funnel.active}
              max={data.app_invite.total_clicks}
              color="#FF69B4"
            />
            <FunnelBar
              label="離脱"
              value={data.app_invite.funnel.churned}
              max={data.app_invite.total_clicks}
              color="#FF6B6B"
            />
            <div className="mt-4 pt-4 border-t border-slate-700">
              <span className="text-slate-400">
                CVR: <span className="text-[#FF69B4] font-bold">{data.app_invite.cvr}%</span>
              </span>
            </div>
          </Card>

          {/* リンク作成ボタン */}
          <Link href="/tracking/new?type=app_invite">
            <Button className="w-full" size="lg" style={{ backgroundColor: '#FF69B4' }}>
              <Plus className="h-5 w-5 mr-2" />
              アプリ紹介リンクを作成
            </Button>
          </Link>
        </TabsContent>
      </Tabs>

      {/* 発行済みリンク一覧へのリンク */}
      <Link href="/tracking/links">
        <Button variant="outline" className="w-full">
          📋 発行済みリンク一覧を見る
        </Button>
      </Link>
    </div>
  );
}
