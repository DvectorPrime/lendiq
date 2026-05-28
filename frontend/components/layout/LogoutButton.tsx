"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { apiRequest } from '@/lib/api';

type LogoutButtonProps = {
  className?: string;
};

export default function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      setIsLoggingOut(false);
      router.push('/login');
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={className}
    >
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </button>
  );
}
