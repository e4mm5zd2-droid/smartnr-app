'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogoutButton } from '@/components/logout-button';
import { UserCircle2, Mail, Calendar, Award, Settings, Bell, HelpCircle, FileText } from 'lucide-react';
import Link from 'next/link';

export default function MyPage() {
  // TODO: Supabaseから実際のユーザー情報を取得
  const user = {
    name: '京極 蓮',
    email: 'kyogoku@example.com',
    rank: 'GOAT',
    joinedAt: '2025-12-01',
  };

  const getRankStyle = (rank: string) => {
    switch (rank) {
      case 'GOAT':
        return {
          bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          text: '#000000',
        };
      case 'Charisma':
        return {
          bg: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
          text: '#FFFFFF',
        };
      default:
        return {
          bg: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
          text: '#FFFFFF',
        };
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-lg mx-auto space-y-4 p-4">
        {/* プロフィールカード */}
        <Card className="bg-zinc-900 p-5 rounded-xl">
          <div className="flex items-center gap-4">
            <UserCircle2 className="h-16 w-16 text-zinc-500" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                <Badge
                  className="px-2 py-1 text-xs font-bold"
                  style={{
                    background: getRankStyle(user.rank).bg,
                    color: getRankStyle(user.rank).text,
                  }}
                >
                  {user.rank}
                </Badge>
              </div>
              <p className="text-sm text-zinc-400 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {user.email}
              </p>
              <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                参加日: {new Date(user.joinedAt).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>
        </Card>

        {/* メニュー */}
        <Card className="bg-zinc-900 p-2 rounded-xl">
          <div className="space-y-1">
            <Link href="/tracking">
              <Button variant="ghost" className="w-full justify-start h-12 text-white hover:bg-zinc-800">
                <Award className="h-5 w-5 mr-3" />
                紹介トラッキング
              </Button>
            </Link>
            <Link href="/concierge">
              <Button variant="ghost" className="w-full justify-start h-12 text-white hover:bg-zinc-800">
                <HelpCircle className="h-5 w-5 mr-3" />
                AI Concierge
              </Button>
            </Link>
          </div>
        </Card>

        {/* 設定 */}
        <Card className="bg-zinc-900 p-2 rounded-xl">
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start h-12 text-zinc-400 hover:bg-zinc-800 hover:text-white">
              <Settings className="h-5 w-5 mr-3" />
              設定
            </Button>
            <Button variant="ghost" className="w-full justify-start h-12 text-zinc-400 hover:bg-zinc-800 hover:text-white">
              <Bell className="h-5 w-5 mr-3" />
              通知設定
            </Button>
          </div>
        </Card>

        {/* ログアウト */}
        <div className="px-2">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
