'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { PWARegister } from './pwa-register';
import { PWAInstaller } from './pwa-installer';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/reset-password' || pathname === '/update-password';

  if (isAuthPage) {
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
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
      <PWAInstaller />
    </>
  );
}
