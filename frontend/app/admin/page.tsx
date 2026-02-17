'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Building2, Settings as SettingsIcon, Database } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

export default function AdminPage() {
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setRole(user.user_metadata?.role || null);
        setUserName(user.user_metadata?.display_name || user.email || '');
      }
    };
    fetchUser();
  }, []);

  const isDeveloper = role === 'developer';

  return (
    <div className="space-y-6 p-4">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <Link href="/mypage">
          <Button variant="ghost" size="icon" className="text-zinc-400">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">管理画面</h1>
          <p className="text-sm text-zinc-400">{userName} でログイン中</p>
        </div>
      </div>

      {/* 統計カード（モック値） */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-zinc-900 p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
              <Users className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">総キャスト</p>
              <p className="text-2xl font-bold text-white">42</p>
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900 p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
              <Building2 className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">総店舗</p>
              <p className="text-2xl font-bold text-white">12</p>
            </div>
          </div>
        </Card>
      </div>

      {/* メニュー */}
      <Card className="bg-zinc-900 p-2 rounded-xl">
        <div className="space-y-1">
          <h3 className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase">⚙️ メニュー</h3>
          
          {isDeveloper && (
            <>
              <Link href="/admin/users">
                <Button variant="ghost" className="w-full justify-start h-12 text-zinc-400 hover:bg-zinc-800 hover:text-white">
                  <Users className="h-5 w-5 mr-3" />
                  ユーザー管理
                  <Badge className="ml-auto bg-zinc-800 text-zinc-500 text-xs">準備中</Badge>
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant="ghost" className="w-full justify-start h-12 text-zinc-400 hover:bg-zinc-800 hover:text-white">
                  <SettingsIcon className="h-5 w-5 mr-3" />
                  システム設定
                  <Badge className="ml-auto bg-zinc-800 text-zinc-500 text-xs">準備中</Badge>
                </Button>
              </Link>
            </>
          )}
          
          <Button variant="ghost" className="w-full justify-start h-12 text-white hover:bg-zinc-800">
            <Database className="h-5 w-5 mr-3" />
            データ概要
          </Button>
        </div>
      </Card>

      {/* 情報カード */}
      <Card className="bg-zinc-900 p-5 rounded-xl border-2 border-white/5">
        <div className="flex items-start gap-3">
          <span className="text-xl">ℹ️</span>
          <div>
            <p className="text-sm text-zinc-300 mb-2">
              詳細な管理機能は今後のアップデートで追加されます
            </p>
            <p className="text-xs text-zinc-500">
              現在は基本的な統計情報の確認のみ可能です
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
