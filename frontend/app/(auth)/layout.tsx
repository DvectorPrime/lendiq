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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(217,119,6,0.14),transparent_42%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-6 py-10 text-slate-900 sm:px-8 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        {children}
      </div>
    </main>
  );
}