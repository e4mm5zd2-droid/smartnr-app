"use client";

import { ArrowLeft, Heart, MessageSquare, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ホーム画面と同じモックデータ
const campaigns = [
  {
    id: 1,
    title: '🔥 2月限定キャンペーン',
    body: '祇園エリアの新規紹介で特別報酬3万円UP！今月末までに成約した案件が対象です。',
    date: '2026-02-15',
    tag: 'キャンペーン',
    likes: 42,
    comments: 8,
  },
  {
    id: 2,
    title: '✨ 新システムリリース',
    body: 'AI Conciergeに「店舗マッチング」機能を追加しました。キャストの特徴を入力すると、最適な店舗を自動提案します。',
    date: '2026-02-14',
    tag: 'アップデート',
    likes: 28,
    comments: 12,
  },
  {
    id: 3,
    title: '📢 メンテナンスのお知らせ',
    body: '2/20（木）2:00〜4:00にシステムメンテナンスを実施します。この間、アプリが利用できなくなります。',
    date: '2026-02-13',
    tag: 'お知らせ',
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

export default function AnnouncementsPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <div className="max-w-lg mx-auto px-4 pt-16">
        {/* ヘッダー */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-zinc-800 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">お知らせ一覧</h1>
        </div>
        
        {/* お知らせリスト */}
        <div className="space-y-3">
          {campaigns.map((campaign) => (
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
      </div>
    </div>
  );
}
