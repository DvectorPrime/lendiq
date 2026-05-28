"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { apiRequest } from "@/lib/api";

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
};

function validateRegisterInput(values: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.firstName.trim()) {
    errors.firstName = 'First name is required.';
  }

  if (!values.lastName.trim()) {
    errors.lastName = 'Last name is required.';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  }

  return errors;
}

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextFieldErrors = validateRegisterInput({ firstName, lastName, email, password });
    setFieldErrors(nextFieldErrors);
    setFormError(null);

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiRequest('/api/auth/register', {
        method: 'POST',
        json: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
        },
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        const message = payload?.message ?? 'Unable to create your account.';

        if (message.toLowerCase().includes('email')) {
          setFieldErrors((currentErrors) => ({
            ...currentErrors,
            email: message,
          }));
        } else if (message.toLowerCase().includes('password')) {
          setFieldErrors((currentErrors) => ({
            ...currentErrors,
            password: message,
          }));
        } else {
          setFormError(message);
        }

        return;
      }

      router.push('/login?registered=1');
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
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Create your account</h1>
          <p className="max-w-sm text-sm leading-6 text-slate-600">
            Register to start using the LendIQ workspace.
          </p>
        </div>

        {formError ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        ) : null}

        <form className="mt-8 grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">First name</span>
              <input
                type="text"
                name="firstName"
                placeholder="Amina"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                aria-invalid={Boolean(fieldErrors.firstName)}
                className={`w-full rounded-2xl border bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 ${fieldErrors.firstName ? 'border-red-400' : 'border-slate-300'}`}
              />
              {fieldErrors.firstName ? <p className="text-sm text-red-600">{fieldErrors.firstName}</p> : null}
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Last name</span>
              <input
                type="text"
                name="lastName"
                placeholder="Yusuf"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                aria-invalid={Boolean(fieldErrors.lastName)}
                className={`w-full rounded-2xl border bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 ${fieldErrors.lastName ? 'border-red-400' : 'border-slate-300'}`}
              />
              {fieldErrors.lastName ? <p className="text-sm text-red-600">{fieldErrors.lastName}</p> : null}
            </label>
          </div>

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
              placeholder="Create a strong password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              className={`w-full rounded-2xl border bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 ${fieldErrors.password ? 'border-red-400' : 'border-slate-300'}`}
            />
            {fieldErrors.password ? <p className="text-sm text-red-600">{fieldErrors.password}</p> : null}
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950" />
            <span>
              I agree to use this account for LendIQ operations.
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-slate-950 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-700">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}