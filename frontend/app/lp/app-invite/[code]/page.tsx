import type { Metadata } from 'next';
import { use } from 'react';
import { AppInviteLPContent } from './content';

export const metadata: Metadata = {
  title: '指名が増える。売上が見える。 | SmartNR キャスト版',
  description: 'お客様の好み・誕生日をずっと覚えていられる。売上管理・指名分析・接客アドバイス。',
  openGraph: {
    title: 'SmartNR キャスト版 - あなた専用の顧客管理',
    description: '指名が増える。売上が見える。',
    type: 'website',
  },
};

export default function AppInviteLPPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  return <AppInviteLPContent code={code} />;
}
