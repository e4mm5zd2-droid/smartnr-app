'use client';

import { usePathname } from 'next/navigation';
import { Header } from './header';
import { BottomNavigation } from './bottom-navigation';
import { FAB } from './fab';
import { PWARegister } from './pwa-register';
import { PWAInstaller } from './pwa-installer';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // 認証ページ・LP・リダイレクトページではレイアウトを表示しない
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/reset-password' || pathname === '/update-password';
  const isPublicPage = pathname.startsWith('/lp/') || pathname.startsWith('/r/');

  if (isAuthPage || isPublicPage) {
    return (
      <>
        <PWARegister />
        {children}
      </>
    );
  }

  return (
    <>
      <PWARegister />
      <div className="flex min-h-screen flex-col bg-slate-950">
        <Header />
        <main className="flex-1 overflow-y-auto pb-20 max-w-lg mx-auto w-full">
          {children}
        </main>
        <BottomNavigation />
        <FAB />
      </div>
      <PWAInstaller />
    </>
  );
}
