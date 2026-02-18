'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Users, Store, Sparkles, MessageSquare, Heart, Calendar } from 'lucide-react';

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
    title: '🎉 紹介機能追加',
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
  const router = useRouter();
  const displayedCampaigns = campaigns.slice(0, 2);
  const hasMore = campaigns.length > 2;

  return (
    <div className="space-y-6 p-4">
      {/* お知らせ（上部に配置） */}
      <div className="space-y-4">
        <div className="space-y-3">
          {displayedCampaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="bg-zinc-900 p-5 hover:bg-zinc-800 transition-colors cursor-pointer rounded-xl"
            >
              <div className="flex gap-3">
                {/* アバター */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold">
                  <Sparkles className="h-5 w-5 text-zinc-950" />
                </div>

                {/* 本文 */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">SmartNR 公式</span>
                    <span className="text-xs text-zinc-500">
                      {new Date(campaign.date).toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-white">{campaign.title}</h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">{campaign.body}</p>
                  
                  <div className="flex items-center gap-4 pt-2">
                    <Badge variant="outline" className="bg-zinc-800 text-zinc-400 text-xs">
                      {campaign.tag}
                    </Badge>
                    
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" />
                        <span>{campaign.likes}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{campaign.comments}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* すべて見るリンク */}
        {hasMore && (
          <button 
            onClick={() => router.push('/announcements')}
            className="w-full text-center text-sm text-zinc-400 hover:text-white transition-colors py-2"
          >
            すべて見る →
          </button>
        )}
      </div>

      {/* クイックアクション（下部に配置） */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">クイックアクション</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/casts/new">
            <Card className="bg-zinc-900 p-5 transition-all hover:bg-zinc-800 cursor-pointer h-full rounded-xl">
              <UserPlus className="h-7 w-7 text-white mb-2" />
              <h3 className="font-semibold text-white">新規登録</h3>
              <p className="text-xs text-zinc-400 mt-1">キャスト情報登録</p>
            </Card>
          </Link>

          <Link href="/casts">
            <Card className="bg-zinc-900 p-5 transition-all hover:bg-zinc-800 cursor-pointer h-full rounded-xl">
              <Users className="h-7 w-7 text-zinc-400 mb-2" />
              <h3 className="font-semibold text-white">キャスト</h3>
              <p className="text-xs text-zinc-400 mt-1">一覧・検索</p>
            </Card>
          </Link>

          <Link href="/stores">
            <Card className="bg-zinc-900 p-5 transition-all hover:bg-zinc-800 cursor-pointer h-full rounded-xl">
              <Store className="h-7 w-7 text-zinc-400 mb-2" />
              <h3 className="font-semibold text-white">店舗</h3>
              <p className="text-xs text-zinc-400 mt-1">管理・詳細</p>
            </Card>
          </Link>

          <Link href="/schedule">
            <Card className="bg-zinc-900 p-5 transition-all hover:bg-zinc-800 cursor-pointer h-full rounded-xl">
              <Calendar className="h-7 w-7 text-zinc-400 mb-2" />
              <h3 className="font-semibold text-white">面接予約</h3>
              <p className="text-xs text-zinc-400 mt-1">スケジュール</p>
            </Card>
          </Link>

          <Link href="/concierge">
            <Card className="bg-zinc-900 p-5 transition-all hover:bg-zinc-800 cursor-pointer h-full rounded-xl">
              <span className="text-2xl mb-2 block">🤖</span>
              <h3 className="font-semibold text-white">AI相談</h3>
              <p className="text-xs text-zinc-400 mt-1">Concierge</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
