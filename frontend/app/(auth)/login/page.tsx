"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { apiRequest } from "@/lib/api";

type FieldErrors = {
  email?: string;
  password?: string;
};

function validateLoginInput(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(
    registered ? 'Registration successful. Sign in to continue.' : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (registered) {
      setFormError('Registration successful. Sign in to continue.');
    }
  }, [registered]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextFieldErrors = validateLoginInput(email, password);
    setFieldErrors(nextFieldErrors);
    setFormError(null);

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        json: {
          email: email.trim(),
          password,
        },
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setFormError(payload?.message ?? 'Unable to sign in. Please try again.');
        return;
      }

      router.push('/dashboard');
    } catch {
      setFormError('Unable to connect to the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="w-full max-w-md rounded-4xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8">
      <div className="rounded-3xl bg-white px-6 py-2 text-slate-900 sm:px-8 sm:py-4">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">LendIQ</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Welcome back</h1>
          <p className="max-w-sm text-sm leading-6 text-slate-600">
            Sign in to continue to the LendIQ workspace.
          </p>
        </div>

        {formError ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        ) : null}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              name="email"
              placeholder="you@lendiq.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              className={`w-full rounded-2xl border bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 ${fieldErrors.email ? 'border-red-400' : 'border-slate-300'}`}
            />
            {fieldErrors.email ? <p className="text-sm text-red-600">{fieldErrors.email}</p> : null}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              className={`w-full rounded-2xl border bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 ${fieldErrors.password ? 'border-red-400' : 'border-slate-300'}`}
            />
            {fieldErrors.password ? <p className="text-sm text-red-600">{fieldErrors.password}</p> : null}
          </label>

          <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950" />
              Remember me
            </label>
            <button type="button" className="font-medium text-slate-950 transition hover:text-slate-700">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Need an account?{" "}
          <Link href="/register" className="font-medium text-slate-950 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-700">
            Register
          </Link>
        </p>
      </div>
    </section>
  );
}