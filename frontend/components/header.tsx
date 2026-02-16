'use client';

import { MobileSidebar } from './sidebar';
import { NotificationsPopover } from './notifications-popover';
import { SearchPopover } from './search-popover';
import { ThemeToggle } from './theme-toggle';
import { PushNotificationButton } from './push-notification-button';
import { LanguageSwitcher } from './language-switcher';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 min-h-[64px] items-center justify-between gap-2 border-b border-border bg-background/50 px-3 backdrop-blur-sm lg:px-6 safe-area-padding">
      <div className="flex items-center gap-2 flex-shrink-0">
        <MobileSidebar />
        <div className="hidden sm:block">
          <SearchPopover />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <div className="sm:hidden">
          <SearchPopover />
        </div>
        <PushNotificationButton />
        <LanguageSwitcher />
        <ThemeToggle />
        <NotificationsPopover />
      </div>
    </header>
  );
}
