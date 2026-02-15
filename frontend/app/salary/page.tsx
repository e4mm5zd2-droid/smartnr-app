'use client';

import {
  DollarSign,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { CommissionSimulator } from '@/components/commission-simulator';

export default function SalaryRequestPage() {
  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      {/* 戻るリンク */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">ダッシュボードに戻る</span>
      </Link>

      {/* ヘッダー */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-4 h-12 w-12 rounded-full" style={{ background: 'linear-gradient(135deg, #00C4CC 0%, #33D4DB 100%)' }}>
          <DollarSign className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold">報酬シミュレーション（旧）</h1>
        <p className="mt-2 text-sm text-slate-400">
          このページは廃止予定です。新しい「💰 報酬計算」ページをご利用ください。
        </p>
        <Link 
          href="/commission"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all"
          style={{ background: 'linear-gradient(135deg, #00C4CC 0%, #33D4DB 100%)' }}
        >
          新しい報酬計算ページへ移動
        </Link>
      </div>

      {/* 報酬シミュレーター */}
      <CommissionSimulator />
    </div>
  );
}
