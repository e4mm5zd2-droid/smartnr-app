"use client";

import { ArrowLeft, Bell } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <div className="max-w-lg mx-auto px-4 pt-16">
        {/* ヘッダー */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="p-2 hover:bg-zinc-800 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">通知</h1>
        </div>
        
        {/* 空状態 */}
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Bell className="w-16 h-16 mb-4" />
          <p className="text-lg">通知はありません</p>
        </div>
      </div>
    </div>
  );
}
