import { redirect } from 'next/navigation';

import { getAuthenticatedUserFromRequest } from '@/lib/auth';

type AuthLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const user = await getAuthenticatedUserFromRequest();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB]">
      {children}
    </main>
  );
}