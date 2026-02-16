import type { Metadata } from 'next';
import { RecruitLPContent } from './content';

export const metadata: Metadata = {
  title: 'ナイトワーク始めませんか？ | SmartNR',
  description: '月収30万円〜。未経験OK。完全サポートでナイトワークデビュー',
};

export default function RecruitLPPage({ params }: { params: { code: string } }) {
  return <RecruitLPContent code={params.code} />;
}
