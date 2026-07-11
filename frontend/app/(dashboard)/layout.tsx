import { redirect } from 'next/navigation';

import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { getAuthenticatedUserFromRequest } from '@/lib/auth';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { ApplicationsProvider } from '@/lib/contexts/ApplicationsContext';

type DashboardLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = await getAuthenticatedUserFromRequest();

  if (!user) {
    redirect('/login');
  }

  return (
    <AuthProvider user={user}>
      <ApplicationsProvider>
        <div className="min-h-screen bg-slate-50 lg:flex">
          <DashboardSidebar user={user} />
          <div className="flex min-h-screen flex-1 flex-col">
            <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </ApplicationsProvider>
    </AuthProvider>
  );
}
