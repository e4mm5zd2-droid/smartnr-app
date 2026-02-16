'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RecruitLPPage() {
  const params = useParams();
  const code = params.code as string;
  const [linkData, setLinkData] = useState<any>(null);

  useEffect(() => {
    // TODO: API経由でリンク情報を取得
    // fetch(`/api/scout-links/${code}`)
  }, [code]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-bold" style={{ color: '#00C4CC' }}>
            ナイトワーク始めませんか？
          </h1>
          <p className="text-xl text-slate-300">
            月収30万円〜 / 未経験OK / 完全サポート
          </p>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <p className="text-slate-400">
              紹介コード: <span className="text-[#00C4CC] font-mono">{code}</span>
            </p>
            <p className="text-sm text-slate-500 mt-2">
              ※ このページは開発中です
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'ナイトワーク始めませんか？ | SmartNR',
  description: '月収30万円〜。未経験OK。完全サポートでナイトワークデビュー',
};
