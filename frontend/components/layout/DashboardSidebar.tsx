import Link from 'next/link';

import LogoutButton from './LogoutButton';
import type { AuthUser } from '@/lib/auth';

type DashboardSidebarProps = {
  user: AuthUser;
};

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const displayRole = user.role.replaceAll('_', ' ').toLowerCase();

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="p-6">
          <div className="text-lg font-semibold tracking-tight text-slate-950">LendIQ</div>
          <p className="mt-1 text-xs uppercase tracking-[0.28em] text-slate-400">Dashboard</p>
        </div>

        <nav className="flex-1 space-y-2 px-3">
          <Link href="/dashboard" className="flex items-center rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-950">
            Overview
          </Link>
          <button type="button" className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-950">
            New application
          </button>
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-950">{user.firstName} {user.lastName}</p>
              <p className="text-xs capitalize text-slate-500">{displayRole}</p>
            </div>
          </div>

          <LogoutButton className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-950 hover:text-slate-950" />
        </div>
      </aside>

      <header className="border-b border-slate-200 bg-white px-4 py-4 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-slate-950">LendIQ</div>
            <p className="text-xs text-slate-500">{user.firstName} {user.lastName}</p>
          </div>
          <LogoutButton className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700" />
        </div>
      </header>
    </>
  );
}
