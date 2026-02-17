'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export function FAB() {
  return (
    <Link
      href="/concierge"
      className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-zinc-200 active:scale-95 touch-target"
      style={{
        boxShadow: '0 4px 20px rgba(255, 255, 255, 0.1), 0 0 30px rgba(255, 255, 255, 0.05)',
      }}
    >
      <MessageCircle className="h-7 w-7 text-zinc-950" strokeWidth={2.5} />
    </Link>
  );
}
