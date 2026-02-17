'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings } from 'lucide-react';
import Link from 'next/link';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 p-4">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <Link href="/admin">
          <Button variant="ghost" size="icon" className="text-zinc-400">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-white">システム設定</h1>
      </div>

      {/* プレースホルダ */}
      <Card className="bg-zinc-900 p-12 text-center rounded-xl">
        <Settings className="h-16 w-16 mx-auto mb-4 text-zinc-600" />
        <h2 className="text-xl font-bold text-white mb-2">準備中</h2>
        <p className="text-zinc-400 text-sm">
          この機能は今後のアップデートで追加されます
        </p>
      </Card>
    </div>
  );
}
