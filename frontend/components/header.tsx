'use client';

import { MobileSidebar } from './sidebar';
import { NotificationsPopover } from './notifications-popover';
import { SearchPopover } from './search-popover';
import { ThemeToggle } from './theme-toggle';
import { PushNotificationButton } from './push-notification-button';
import { LanguageSwitcher } from './language-switcher';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-14 min-h-[56px] items-center justify-between gap-2 border-b border-border bg-background/95 backdrop-blur-sm lg:h-16 lg:px-6" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))', paddingLeft: 'max(0.75rem, env(safe-area-inset-left))', paddingRight: 'max(0.75rem, env(safe-area-inset-right))' }}>
      <div className="flex items-center gap-3 flex-shrink-0">
        <MobileSidebar />
      </div>

      <div className="hidden lg:flex flex-1 max-w-md">
        <SearchPopover />
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <PushNotificationButton />
        <LanguageSwitcher />
        <ThemeToggle />
        <NotificationsPopover />
      </div>
    </header>
  );
}
