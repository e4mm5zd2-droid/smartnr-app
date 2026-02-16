import type { Metadata } from 'next';
import { RecruitLPContent } from './content';

export const metadata: Metadata = {
  title: 'ナイトワーク始めませんか？ | SmartNR',
  description: '月収30万円〜。未経験OK・完全サポート。日払い対応・終電上がりOK。京都祇園エリアの優良店をご紹介',
  openGraph: {
    title: 'ナイトワーク始めませんか？',
    description: '月収30万円〜。未経験OK・完全サポート',
    type: 'website',
  },
};

export default function RecruitLPPage({ params }: { params: { code: string } }) {
  return <RecruitLPContent code={params.code} />;
}
