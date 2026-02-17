'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

export function FAB() {
  return (
    <Link
      href="/casts/new"
      className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 touch-target"
      style={{
        background: 'linear-gradient(135deg, #00C4CC 0%, #00A3AA 100%)',
        boxShadow: '0 4px 20px rgba(0, 196, 204, 0.4), 0 0 30px rgba(0, 196, 204, 0.2)',
      }}
    >
      <Plus className="h-7 w-7 text-white" strokeWidth={2.5} />
    </Link>
  );
}
