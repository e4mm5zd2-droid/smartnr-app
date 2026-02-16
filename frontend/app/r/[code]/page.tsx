'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function RedirectPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  useEffect(() => {
    const recordClickAndRedirect = async () => {
      try {
        const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://smartnr-backend.onrender.com').replace(/\/+$/, '');
        const response = await fetch(`${API_BASE_URL}/api/scout-links/r/${code}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ip_address: '', // サーバー側で取得
            user_agent: navigator.userAgent,
            referer: document.referrer,
          }),
        });

        if (!response.ok) {
          throw new Error('Invalid link');
        }

        const data = await response.json();
        
        if (data.redirect_url) {
          router.replace(data.redirect_url);
        } else {
          router.replace('/404');
        }
      } catch (error) {
        console.error('Redirect error:', error);
        router.replace('/404');
      }
    };

    if (code) {
      recordClickAndRedirect();
    }
  }, [code, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-slate-400">リダイレクト中...</p>
      </div>
    </div>
  );
}
