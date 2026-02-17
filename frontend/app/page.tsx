'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Users, Store, ArrowRight, Calculator, Sparkles, Calendar, MessageSquare, Heart, Repeat2 } from 'lucide-react';

// キャンペーン掲示板のモックデータ（将来的にSupabaseのcampaignsテーブルから取得）
const campaigns = [
  {
    id: 1,
    title: '🔥 2月限定キャンペーン',
    body: '祇園エリアの新規紹介で報酬1.5倍！今月中に成約した案件が対象です。',
    date: '2026-02-15',
    tag: 'キャンペーン',
    likes: 12,
    comments: 3,
  },
  {
    id: 2,
    title: '✨ 新システムリリース',
    body: 'AI Conciergeに「店舗マッチング」機能が追加されました。キャストの希望条件を入力するだけで最適な店舗を提案します。',
    date: '2026-02-14',
    tag: 'お知らせ',
    likes: 8,
    comments: 1,
  },
  {
    id: 3,
    title: '💰 報酬シミュレーター公開',
    body: 'リアルタイムで収入計算ができる「報酬シミュレーター」をリリースしました。店舗別の分配率も確認できます。',
    date: '2026-02-13',
    tag: 'アップデート',
    likes: 15,
    comments: 5,
  },
  {
    id: 4,
    title: '🎉 紹介トラッキング機能追加',
    body: 'スカウト専用の紹介リンクが発行できるようになりました。QRコード生成・クリック数・成約率の確認が可能です。',
    date: '2026-02-12',
    tag: 'アップデート',
    likes: 20,
    comments: 7,
  },
  {
    id: 5,
    title: '📋 週次レポート配信開始',
    body: '毎週月曜に先週の活動サマリーをLINEで配信します。成約数・報酬・ランキングをチェックしましょう。',
    date: '2026-02-10',
    tag: 'お知らせ',
    likes: 6,
    comments: 2,
  },
];

export default function Home() {
  return (
    <div className="space-y-6 p-4">
      {/* キャンペーン掲示板（Xタイムライン風） */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">お知らせ</h2>
          <Badge variant="outline" className="border-[#00C4CC]/30 bg-[#00C4CC]/10 text-[#00C4CC]">
            {campaigns.length}件
          </Badge>
        </div>
        
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex gap-3">
                {/* アバター */}
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg, #00C4CC 0%, #33D4DB 100%)' }}
                >
                  <Sparkles className="h-5 w-5 text-white" />
                </div>

                {/* 本文 */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">SmartNR 公式</span>
                    <span className="text-xs text-slate-500">
                      {new Date(campaign.date).toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-white">{campaign.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{campaign.body}</p>
                  
                  <div className="flex items-center gap-4 pt-2">
                    <Badge
                      variant="outline"
                      className="border-slate-700 bg-slate-800/50 text-slate-300 text-xs"
                    >
                      {campaign.tag}
                    </Badge>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <button className="flex items-center gap-1 hover:text-red-400 transition-colors">
                        <Heart className="h-3.5 w-3.5" />
                        <span>{campaign.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{campaign.comments}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* クイックアクション */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">クイックアクション</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/casts/new">
            <Card
              className="group border-slate-800 p-4 transition-all cursor-pointer h-full"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 196, 204, 0.1) 0%, rgba(0, 196, 204, 0.05) 100%)',
              }}
            >
              <UserPlus className="h-7 w-7 mb-2" style={{ color: '#00C4CC' }} />
              <h3 className="font-semibold text-white">新規登録</h3>
              <p className="text-xs text-slate-400 mt-1">キャスト情報登録</p>
            </Card>
          </Link>

          <Link href="/casts">
            <Card className="group border-slate-800 bg-slate-900/50 p-4 transition-all hover:border-slate-700 hover:bg-slate-800/50 cursor-pointer h-full">
              <Users className="h-7 w-7 text-slate-400 mb-2" />
              <h3 className="font-semibold text-white">キャスト</h3>
              <p className="text-xs text-slate-400 mt-1">一覧・検索</p>
            </Card>
          </Link>

          <Link href="/stores">
            <Card className="group border-slate-800 bg-slate-900/50 p-4 transition-all hover:border-slate-700 hover:bg-slate-800/50 cursor-pointer h-full">
              <Store className="h-7 w-7 text-slate-400 mb-2" />
              <h3 className="font-semibold text-white">店舗</h3>
              <p className="text-xs text-slate-400 mt-1">管理・詳細</p>
            </Card>
          </Link>

          <Link href="/commission">
            <Card className="group border-slate-800 bg-slate-900/50 p-4 transition-all hover:border-slate-700 hover:bg-slate-800/50 cursor-pointer h-full relative">
              <Calculator className="h-7 w-7 text-slate-400 mb-2" />
              <h3 className="font-semibold text-white">報酬計算</h3>
              <p className="text-xs text-slate-400 mt-1">シミュレーター</p>
              <Badge
                variant="outline"
                className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5"
                style={{
                  borderColor: 'rgba(0, 196, 204, 0.3)',
                  backgroundColor: 'rgba(0, 196, 204, 0.1)',
                  color: '#00C4CC',
                }}
              >
                NEW
              </Badge>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
