'use client';

export function AppInviteLPContent({ code }: { code: string }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-bold" style={{ color: '#00C4CC' }}>
            指名が増える。売上が見える。
          </h1>
          <p className="text-xl text-slate-300">
            SmartNR キャスト版で効率的に働く
          </p>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <p className="text-slate-400">
              招待コード: <span className="text-[#00C4CC] font-mono">{code}</span>
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
