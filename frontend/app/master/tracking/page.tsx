'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DailyReport {
  date: string;
  new_clicks: number;
  new_submissions: number;
  status_changes: Array<{
    name: string;
    from: string;
    to: string;
    scout: string;
  }>;
  new_app_registrations: number;
  alerts: Array<{
    type: string;
    message: string;
  }>;
}

interface OverviewData {
  period: string;
  recruit: {
    total_links: number;
    active_links: number;
    total_clicks: number;
    total_submissions: number;
    overall_cvr: number;
    funnel: {
      submitted: number;
      contacted: number;
      interviewed: number;
      trial: number;
      hired: number;
      active: number;
    };
    total_sb_earned: number;
    unpaid_sb: number;
  };
  app_invite: {
    total_links: number;
    active_links: number;
    total_clicks: number;
    total_submissions: number;
    overall_cvr: number;
    funnel: {
      submitted: number;
      registered: number;
      active: number;
      churned: number;
    };
  };
  active_scouts: number;
  top_performer_scout_id: number | null;
  top_performer_name: string | null;
}

interface ScoutPerformance {
  scout_id: number;
  name: string;
  recruit: {
    links: number;
    clicks: number;
    submissions: number;
    cvr: number;
    hired: number;
    sb_earned: number;
  };
  app_invite: {
    links: number;
    clicks: number;
    submissions: number;
    cvr: number;
    active_users: number;
  };
  total_score: number;
  rank: number;
}

export default function MasterTrackingPage() {
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [scouts, setScouts] = useState<ScoutPerformance[]>([]);
  const [period, setPeriod] = useState('2026-02');
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'https://smartnr-backend.onrender.com';
  const MASTER_ID = 3; // システム管理者（role='admin'）

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      const [reportRes, overviewRes, scoutsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/master/tracking/daily-report?master_id=${MASTER_ID}`),
        fetch(`${API_BASE_URL}/api/master/tracking/overview?master_id=${MASTER_ID}&period=${period}`),
        fetch(`${API_BASE_URL}/api/master/tracking/scouts?master_id=${MASTER_ID}&sort_by=sb_earned&period=${period}`)
      ]);

      if (reportRes.ok) setDailyReport(await reportRes.json());
      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (scoutsRes.ok) {
        const data = await scoutsRes.json();
        setScouts(data.scouts);
      }
    } catch (err) {
      console.error('Failed to fetch master data:', err);
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

  return (
    <div className="space-y-6 p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl">👑</div>
          <h1 className="text-3xl font-bold text-white">マスター管理</h1>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2026-02">今月（2月）</SelectItem>
            <SelectItem value="2026-01">先月（1月）</SelectItem>
            <SelectItem value="2026">今年（2026）</SelectItem>
            <SelectItem value="all">全期間</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 日次速報バナー */}
      {dailyReport && (
        <Card className="border-slate-700 bg-slate-900/50 p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              📅 本日 {new Date().toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' })} の速報
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-400">🆕 新規クリック</p>
                <p className="text-2xl font-bold text-[#00C4CC]">+{dailyReport.new_clicks}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">📩 新規応募</p>
                <p className="text-2xl font-bold text-[#00C4CC]">+{dailyReport.new_submissions}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">💎 アプリ登録</p>
                <p className="text-2xl font-bold text-[#FF69B4]">+{dailyReport.new_app_registrations}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">⚡ ステータス変更</p>
                <p className="text-2xl font-bold text-slate-300">{dailyReport.status_changes.length}件</p>
              </div>
            </div>

            {/* アラート */}
            {dailyReport.alerts.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-700">
                {dailyReport.alerts.map((alert, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className={alert.type === 'low_cvr' ? 'border-red-500 text-red-400' : 'border-green-500 text-green-400'}
                  >
                    {alert.type === 'low_cvr' ? '⚠️' : '🎉'} {alert.message}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* メインタブ */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800">
          <TabsTrigger value="overview">📊 全体</TabsTrigger>
          <TabsTrigger value="recruit">🌙 募集</TabsTrigger>
          <TabsTrigger value="app">💎 アプリ</TabsTrigger>
          <TabsTrigger value="scouts">👤 スカウト</TabsTrigger>
        </TabsList>

        {/* タブ1: 全体 */}
        <TabsContent value="overview" className="space-y-6">
          {overview && (
            <>
              {/* 統計カード */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatsCard title="リンク" value={overview.recruit.total_links + overview.app_invite.total_links} />
                <StatsCard title="クリック" value={overview.recruit.total_clicks + overview.app_invite.total_clicks} />
                <StatsCard title="応募" value={overview.recruit.total_submissions} />
                <StatsCard title="採用" value={overview.recruit.funnel.hired} />
                <StatsCard title="SB合計" value={`¥${Math.floor(overview.recruit.total_sb_earned / 10000)}万`} accent="#00C4CC" />
                <StatsCard title="未払SB" value={`¥${Math.floor(overview.recruit.unpaid_sb / 10000)}万`} accent="#FF6B6B" />
              </div>

              {/* アプリ紹介統計 */}
              <Card className="border-slate-700 bg-slate-900/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  💎 アプリ紹介
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <StatsCard title="登録" value={overview.app_invite.funnel.submitted} accent="#FF69B4" />
                  <StatsCard title="利用中" value={overview.app_invite.funnel.active} accent="#FF69B4" />
                  <StatsCard title="離脱" value={overview.app_invite.funnel.churned} accent="#FF6B6B" />
                </div>
              </Card>

              {/* 募集ファネル */}
              <Card className="border-slate-700 bg-slate-900/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4">📊 募集ファネル</h3>
                <FunnelBar label="クリック" value={overview.recruit.total_clicks} max={overview.recruit.total_clicks} color="#00C4CC" />
                <FunnelBar label="応募" value={overview.recruit.funnel.submitted} max={overview.recruit.total_clicks} color="#00C4CC" />
                <FunnelBar label="連絡済み" value={overview.recruit.funnel.contacted} max={overview.recruit.total_clicks} color="#00C4CC" />
                <FunnelBar label="面接" value={overview.recruit.funnel.interviewed} max={overview.recruit.total_clicks} color="#00C4CC" />
                <FunnelBar label="体入" value={overview.recruit.funnel.trial} max={overview.recruit.total_clicks} color="#00C4CC" />
                <FunnelBar label="採用" value={overview.recruit.funnel.hired} max={overview.recruit.total_clicks} color="#00C4CC" />
                <FunnelBar label="稼働中" value={overview.recruit.funnel.active} max={overview.recruit.total_clicks} color="#00C4CC" />
                <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between text-sm">
                  <span className="text-slate-400">全体CVR: <span className="text-[#00C4CC] font-bold">{overview.recruit.overall_cvr}%</span></span>
                  <span className="text-slate-400">応募→採用率: <span className="text-[#00C4CC] font-bold">{((overview.recruit.funnel.hired / overview.recruit.funnel.submitted) * 100).toFixed(1)}%</span></span>
                </div>
              </Card>

              {/* アプリ紹介ファネル */}
              <Card className="border-slate-700 bg-slate-900/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4">📊 アプリ紹介ファネル</h3>
                <FunnelBar label="クリック" value={overview.app_invite.total_clicks} max={overview.app_invite.total_clicks} color="#FF69B4" />
                <FunnelBar label="登録" value={overview.app_invite.funnel.submitted} max={overview.app_invite.total_clicks} color="#FF69B4" />
                <FunnelBar label="利用中" value={overview.app_invite.funnel.active} max={overview.app_invite.total_clicks} color="#FF69B4" />
                <FunnelBar label="離脱" value={overview.app_invite.funnel.churned} max={overview.app_invite.total_clicks} color="#FF6B6B" />
                <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between text-sm">
                  <span className="text-slate-400">全体CVR: <span className="text-[#FF69B4] font-bold">{overview.app_invite.overall_cvr}%</span></span>
                  <span className="text-slate-400">定着率: <span className="text-[#FF69B4] font-bold">{((overview.app_invite.funnel.active / overview.app_invite.funnel.submitted) * 100).toFixed(1)}%</span></span>
                </div>
              </Card>
            </>
          )}
        </TabsContent>

        {/* タブ2: 募集 */}
        <TabsContent value="recruit">
          <Card className="border-slate-700 bg-slate-900/50 p-6">
            <p className="text-slate-400">募集詳細（グラフ・店舗別ランキング）は次のバージョンで実装予定</p>
          </Card>
        </TabsContent>

        {/* タブ3: アプリ */}
        <TabsContent value="app">
          <Card className="border-slate-700 bg-slate-900/50 p-6">
            <p className="text-slate-400">アプリ詳細（グラフ・離脱者リスト）は次のバージョンで実装予定</p>
          </Card>
        </TabsContent>

        {/* タブ4: スカウト別 */}
        <TabsContent value="scouts" className="space-y-4">
          {scouts.map((scout, idx) => {
            const rankEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '';
            const borderColor = idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : 'transparent';
            const isLowCVR = scout.recruit.cvr < 10;

            return (
              <Card
                key={scout.scout_id}
                className="border-slate-700 bg-slate-900/50 p-6"
                style={{ borderLeftWidth: '4px', borderLeftColor: borderColor }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {rankEmoji} {scout.name}
                    </h3>
                    <Button variant="outline" size="sm" className="text-xs">
                      📊 詳細を見る
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* 募集実績 */}
                    <div className="space-y-2">
                      <p className="text-sm text-slate-400">🌙 キャスト募集</p>
                      <div className="space-y-1 text-sm">
                        <p className="text-slate-300">リンク{scout.recruit.links} | 応募{scout.recruit.submissions} | 採用{scout.recruit.hired}</p>
                        <p className="text-slate-300">
                          CVR: <span className={isLowCVR ? 'text-red-400 font-bold' : 'text-[#00C4CC] font-bold'}>{scout.recruit.cvr}%</span>
                          {isLowCVR && ' ⚠️'}
                        </p>
                        <p className="text-slate-300">SB: <span className="text-[#00C4CC] font-bold">¥{Math.floor(scout.recruit.sb_earned / 10000)}万</span></p>
                      </div>
                    </div>

                    {/* アプリ紹介実績 */}
                    <div className="space-y-2">
                      <p className="text-sm text-slate-400">💎 アプリ紹介</p>
                      <div className="space-y-1 text-sm">
                        <p className="text-slate-300">登録{scout.app_invite.submissions} | 利用中{scout.app_invite.active_users}</p>
                        <p className="text-slate-300">CVR: <span className="text-[#FF69B4] font-bold">{scout.app_invite.cvr}%</span></p>
                      </div>
                    </div>
                  </div>

                  {isLowCVR && (
                    <Badge variant="outline" className="border-red-500 text-red-400">
                      ⚠️ CVRが低い
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 統計カードコンポーネント
function StatsCard({ title, value, accent }: { title: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-xl p-4 backdrop-blur-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
      <p className="text-xs text-slate-400 mb-1">{title}</p>
      <p className="text-2xl font-bold" style={{ color: accent || '#FFFFFF' }}>{value}</p>
    </div>
  );
}

// ファネルバーコンポーネント
function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percentage = (value / max) * 100;

  return (
    <div className="py-2">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color}80 0%, ${color} 100%)`,
          }}
        />
      </div>
    </div>
  );
}
