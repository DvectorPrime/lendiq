import Link from "next/link";
import { BarChart3, Brain, FileCheck, Shield, ArrowRight, ChevronRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-gray-900">LendIQ</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-[#2563EB]/5 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-medium text-[#2563EB]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
              Alternative Credit Intelligence Platform
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Credit decisions that are{" "}
              <span className="text-[#2563EB]">intelligent</span>,{" "}
              <span className="text-[#2563EB]">explainable</span>, and{" "}
              <span className="text-[#2563EB]">inclusive</span>.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-500 sm:text-lg">
              LendIQ uses machine learning to score loan applications using alternative data —
              giving credit access to the 40 million+ credit-invisible Nigerians while protecting
              your institution from risk.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3-Column Feature Grid ── */}
      <section className="border-t border-gray-100 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Three capabilities. One platform.
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              Everything a loan officer needs to make confident, data-driven credit decisions.
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Score */}
            <div className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-md">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB] transition-colors group-hover:bg-[#2563EB] group-hover:text-white">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Score</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Our XGBoost model evaluates applicants using 15 alternative data signals — income, employment, assets, and demographics — to produce a calibrated risk probability.
              </p>
            </div>

            {/* Explain */}
            <div className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-md">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB] transition-colors group-hover:bg-[#2563EB] group-hover:text-white">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Explain</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Every decision comes with a SHAP-powered breakdown of the top factors that influenced the score. No black boxes — full transparency for officers and applicants.
              </p>
            </div>

            {/* Decide */}
            <div className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-md sm:col-span-2 lg:col-span-1">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB] transition-colors group-hover:bg-[#2563EB] group-hover:text-white">
                <FileCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Decide</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Approve, reject, or flag for review — all backed by data. Admins can override any automated decision with a full audit trail preserved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="border-t border-gray-100 bg-[#F9FAFB] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              How it works
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              From application to decision in under 3 seconds.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {/* Step 1 */}
            <div className="relative rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB] text-sm font-bold text-white">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Submit Application</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                A loan officer completes the 3-step application form with the applicant&apos;s demographics, employment, financial, and loan details.
              </p>
              {/* Arrow connector (visible on desktop only) */}
              <div className="absolute -right-5 top-1/2 hidden -translate-y-1/2 lg:block">
                <ChevronRight className="h-5 w-5 text-gray-300" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB] text-sm font-bold text-white">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900">ML Scores the Risk</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                The backend sends the data to our ML microservice, which runs inference through an XGBoost pipeline and computes SHAP explanations in real time.
              </p>
              <div className="absolute -right-5 top-1/2 hidden -translate-y-1/2 lg:block">
                <ChevronRight className="h-5 w-5 text-gray-300" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB] text-sm font-bold text-white">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Review the Decision</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                The officer sees a risk score, an approval/rejection decision, and a visual SHAP chart explaining exactly why the model made that call.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="border-t border-gray-100 bg-gradient-to-br from-[#1e3a5f] to-[#0f2440] py-20 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to make smarter lending decisions?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-blue-100/70">
            Create a free account and start scoring loan applications with machine learning in minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
            >
              Create Your Account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#2563EB]">
              <BarChart3 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">LendIQ</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>Built as a capstone project</span>
            <span className="hidden h-3 w-px bg-gray-300 sm:block" />
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-gray-900"
            >
              <Shield className="h-3.5 w-3.5" />
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
