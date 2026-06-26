'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUser } from '@/lib/api';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    const user = getUser();
    if (user?.role === 'Admin') {
      router.replace('/dashboard/admin');
    } else {
      router.replace('/dashboard/employee');
    }
  }, [router]);

  return <></>;
}
