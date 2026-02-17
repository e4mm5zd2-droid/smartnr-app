'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogoutButton } from '@/components/logout-button';
import { UserCircle2, Mail, Calendar, Award, Settings, Bell, HelpCircle, Shield } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

export default function MyPage() {
  const [user, setUser] = useState({
    name: '京極 蓮',
    email: 'kyogoku@example.com',
    joinedAt: '2025-12-01',
  });
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({
          name: authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || '京極 蓮',
          email: authUser.email || 'kyogoku@example.com',
          joinedAt: authUser.created_at || '2025-12-01',
        });
        setRole(authUser.user_metadata?.role || null);
      }
    };
    fetchUser();
  }, []);

  const isAdmin = role === 'developer' || role === 'owner';

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-lg mx-auto space-y-4 p-4">
        {/* プロフィールカード */}
        <Card className="bg-zinc-900 p-5 rounded-xl">
          <div className="flex items-center gap-4">
            <UserCircle2 className="h-16 w-16 text-zinc-500" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">{user.name}</h2>
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
                紹介
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
            {isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" className="w-full justify-start h-12 text-white hover:bg-zinc-800">
                  <Shield className="h-5 w-5 mr-3" />
                  🔧 管理画面
                </Button>
              </Link>
            )}
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
