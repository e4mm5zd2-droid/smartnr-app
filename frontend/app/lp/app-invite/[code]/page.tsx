import type { Metadata } from 'next';
import { AppInviteLPContent } from './content';

export const metadata: Metadata = {
  title: '指名が増える。売上が見える。 | SmartNR',
  description: 'SmartNR キャスト版で効率的に働く。売上管理・シフト管理・指名分析',
};

export default function AppInviteLPPage({ params }: { params: { code: string } }) {
  return <AppInviteLPContent code={params.code} />;
}
