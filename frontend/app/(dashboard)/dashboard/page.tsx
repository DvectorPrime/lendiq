export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Dashboard</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Welcome to LendIQ</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Your authenticated workspace is ready. This shell will later host the application workflow and review tools.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Applications</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">24</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Approval Rate</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">67%</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Average Risk Score</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">41</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Recent activity</h2>
            <p className="text-sm text-slate-500">Simple placeholder content for the protected dashboard.</p>
          </div>
          <button type="button" className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white">
            New Application
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="py-3 pr-4">Applicant</th>
                <th className="py-3 pr-4">Submitted</th>
                <th className="py-3 pr-4">Risk</th>
                <th className="py-3 pr-4">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-4 pr-4 font-medium text-slate-950">Amina Yusuf</td>
                <td className="py-4 pr-4 text-slate-600">Today</td>
                <td className="py-4 pr-4 text-emerald-600">28</td>
                <td className="py-4 pr-4 text-slate-600">Approved</td>
              </tr>
              <tr>
                <td className="py-4 pr-4 font-medium text-slate-950">Emeka Okafor</td>
                <td className="py-4 pr-4 text-slate-600">Yesterday</td>
                <td className="py-4 pr-4 text-amber-600">52</td>
                <td className="py-4 pr-4 text-slate-600">Review</td>
              </tr>
              <tr>
                <td className="py-4 pr-4 font-medium text-slate-950">Ngozi Anya</td>
                <td className="py-4 pr-4 text-slate-600">2 days ago</td>
                <td className="py-4 pr-4 text-red-600">79</td>
                <td className="py-4 pr-4 text-slate-600">Rejected</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
