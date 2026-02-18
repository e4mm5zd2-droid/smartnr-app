'use client';

import Link from 'next/link';
import { NotificationsPopover } from './notifications-popover';
import { SearchPopover } from './search-popover';
import { PushNotificationButton } from './push-notification-button';

export function Header() {
  return (
    <header 
      className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md"
      style={{ 
        paddingTop: 'max(0.75rem, env(safe-area-inset-top))', 
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))', 
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))' 
      }}
    >
      {/* ロゴ */}
      <Link href="/" className="flex items-center px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
          <span className="text-sm font-bold text-zinc-950">SN</span>
        </div>
      </Link>

      {/* 右側アイコン */}
      <div className="flex items-center gap-2 px-4">
        <PushNotificationButton />
        <NotificationsPopover />
      </div>
    </header>
  );
}
