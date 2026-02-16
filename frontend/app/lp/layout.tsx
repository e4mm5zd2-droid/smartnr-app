import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'SmartNR',
  description: 'ナイトワークのお仕事紹介',
  openGraph: {
    title: 'SmartNR',
    description: 'ナイトワークのお仕事紹介',
    type: 'website',
  },
};

export default function LPLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
