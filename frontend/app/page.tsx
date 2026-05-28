import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(217,119,6,0.12),transparent_40%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-6 py-10 text-slate-900 sm:px-8 lg:px-10">
      <section className="w-full max-w-5xl overflow-hidden rounded-4xl border border-slate-200/80 bg-white/90 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-between gap-10 bg-slate-950 px-6 py-10 text-white sm:px-8 sm:py-12 lg:px-10 lg:py-14">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-amber-200/90">
                LendIQ
              </div>
              <div className="space-y-4">
                <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  A quiet, professional starting point for the LendIQ interface.
                </h1>
                <p className="max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
                  The login and register pages are now available as a clean UI prototype. API integration will come later.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Routes</p>
                <p className="mt-2 text-sm font-medium text-white">/login and /register</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Scope</p>
                <p className="mt-2 text-sm font-medium text-white">UI only for now</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Tone</p>
                <p className="mt-2 text-sm font-medium text-white">Minimal and clear</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-5 px-6 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Start here</p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Choose a path</h2>
              <p className="text-sm leading-6 text-slate-600">
                Use the auth screens to preview the new visual direction before wiring any backend logic.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Open login
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:border-slate-950"
              >
                Open register
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              No API calls are connected yet. The goal here is to lock in the interface before implementation work begins.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
