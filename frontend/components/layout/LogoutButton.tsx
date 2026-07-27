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
      className={`${className || ''} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoggingOut ? (
        <>
          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Logging out...
        </>
      ) : (
        'Logout'
      )}
    </button>
  );
}
