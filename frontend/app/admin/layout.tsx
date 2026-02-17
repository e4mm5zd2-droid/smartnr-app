'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          router.push('/');
          return;
        }

        const role = user.user_metadata?.role;
        
        if (role !== 'developer' && role !== 'owner') {
          router.push('/');
          return;
        }

        setIsAuthorized(true);
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return null; // フラッシュ防止
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
