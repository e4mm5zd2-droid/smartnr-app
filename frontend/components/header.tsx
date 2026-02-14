'use client';

import { MobileSidebar } from './sidebar';
import { NotificationsPopover } from './notifications-popover';
import { SearchPopover } from './search-popover';
import { ThemeToggle } from './theme-toggle';
import { PushNotificationButton } from './push-notification-button';
import { LanguageSwitcher } from './language-switcher';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/50 px-4 backdrop-blur-sm lg:px-6">
      <MobileSidebar />
      
      <SearchPopover />

      <div className="flex items-center gap-2">
        <PushNotificationButton />
        <LanguageSwitcher />
        <ThemeToggle />
        <NotificationsPopover />
      </div>
    </header>
  );
}
