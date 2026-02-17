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
        <p className="text-zinc-400">読み込み中...</p>
      </div>
    );
  }

  if (!data || !data.recruit || !data.app_invite) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-zinc-400">データが取得できませんでした</p>
          <p className="text-sm text-zinc-500">バックエンドAPIに接続できません</p>
          <Button onClick={fetchData}>再試行</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🔗</div>
          <h1 className="text-3xl font-bold text-white">紹介</h1>
        </div>
      </div>

      {/* アプリ紹介 */}
      <div className="space-y-6">
          {/* 統計カード */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard title="リンク" value={data.app_invite.total_links} />
            <StatCard title="クリック" value={data.app_invite.total_clicks} />
            <StatCard title="登録" value={data.app_invite.total_submissions} accent="#a1a1aa" />
          </div>

          {/* ファネル */}
          <Card className="border-0 bg-zinc-900/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4">📊 ファネル</h3>
            <FunnelBar
              label="クリック"
              value={data.app_invite.total_clicks}
              max={data.app_invite.total_clicks}
              color="#71717a"
            />
            <FunnelBar
              label="登録"
              value={data.app_invite.funnel.submitted}
              max={data.app_invite.total_clicks}
              color="#71717a"
            />
            <FunnelBar
              label="利用中"
              value={data.app_invite.funnel.active}
              max={data.app_invite.total_clicks}
              color="#71717a"
            />
            <FunnelBar
              label="離脱"
              value={data.app_invite.funnel.churned}
              max={data.app_invite.total_clicks}
              color="#52525b"
            />
            <div className="mt-4 pt-4 border-t border-zinc-700">
              <span className="text-zinc-400">
                CVR: <span className="text-zinc-300 font-bold">{data.app_invite.cvr}%</span>
              </span>
            </div>
          </Card>

          {/* リンク作成ボタン */}
          <Link href="/tracking/new?type=app_invite">
            <Button className="w-full" size="lg">
              <Plus className="h-5 w-5 mr-2" />
              アプリ紹介リンクを作成
            </Button>
          </Link>
        </div>

      {/* 発行済みリンク一覧へのリンク */}
      <Link href="/tracking/links">
        <Button variant="outline" className="w-full">
          📋 発行済みリンク一覧を見る
        </Button>
      </Link>
    </div>
  );
}
