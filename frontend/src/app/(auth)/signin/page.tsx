'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircleIcon, EyeIcon, EyeOffIcon, Loader2Icon } from 'lucide-react';
import { AuthLayout } from '@/components/AuthLayout';
import { Field } from '@/components/ui';

type Role = 'citizen' | 'staff';
type FormErrors = { id?: string; password?: string };

function SignIn() {
  const params = useSearchParams();
  const router = useRouter();
  const [role, setRole] = useState<Role>(params.get('role') === 'staff' ? 'staff' : 'citizen');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: FormErrors = {};
    if (!id.trim()) {
      next.id =
        role === 'staff'
          ? 'Enter your county staff email.'
          : 'Enter your email address or phone number.';
    }
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    setAuthError('');
    if (Object.keys(next).length) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (password === 'wrong') {
        setAuthError('The details you entered don’t match our records. Check them and try again.');
        return;
      }
      if (role === 'staff') {
        const isAdmin = id.trim().toLowerCase().startsWith('admin');
        router.push(isAdmin ? '/admin' : '/officer');
      } else {
        router.push('/portal');
      }
    }, 700);
  };

  return (
    <AuthLayout>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">Welcome back</h1>
      <p className="mt-2 text-muted">Sign in to report issues and follow your requests.</p>

      <div className="mt-8 grid grid-cols-2 rounded-xl bg-canvas p-1" role="tablist" aria-label="Account type">
        {(['citizen', 'staff'] as const).map((r) => (
          <button
            key={r}
            type="button"
            role="tab"
            aria-selected={role === r}
            onClick={() => setRole(r)}
            className={`rounded-lg py-2 text-sm font-semibold transition-colors duration-150 ${
              role === r ? 'bg-white text-ink shadow-card' : 'text-muted hover:text-ink'
            }`}
          >
            {r === 'citizen' ? 'Resident' : 'County staff'}
          </button>
        ))}
      </div>

      {authError && (
        <div
          role="alert"
          className="mt-6 flex gap-3 rounded-xl border border-danger/25 bg-danger-50 p-4 text-sm text-[#7A1C1C]"
        >
          <AlertCircleIcon className="h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
          {authError}
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
        <Field
          label={role === 'staff' ? 'Staff email' : 'Email or phone number'}
          htmlFor="id"
          error={errors.id}
        >
          <input
            id="id"
            className={`field h-11 ${errors.id ? 'field-error' : ''}`}
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder={role === 'staff' ? 'name@muranga.go.ke' : 'you@example.com or 07XX XXX XXX'}
            aria-invalid={!!errors.id}
            aria-describedby={errors.id ? 'id-error' : undefined}
            autoComplete="username"
          />
        </Field>

        <Field label="Password" htmlFor="password" error={errors.password}>
          <div className="relative">
            <input
              id="password"
              type={show ? 'text' : 'password'}
              className={`field h-11 pr-11 ${errors.password ? 'field-error' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:text-ink"
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" className="h-4 w-4 rounded border-line accent-brand" /> Remember me
          </label>
          <Link href="/auth/forgot" className="text-sm font-semibold text-brand hover:text-brand-dark">
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="btn-primary h-12 w-full text-[15px]" disabled={loading}>
          {loading ? (
            <>
              <Loader2Icon className="h-4 w-4 animate-spin" /> Signing in…
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {role === 'citizen' ? (
        <p className="mt-8 text-center text-sm text-muted">
          New to the portal?{' '}
          <Link href="/register" className="font-bold text-brand hover:text-brand-dark">
            Create an account
          </Link>
        </p>
      ) : (
        <p className="mt-8 rounded-xl bg-canvas p-4 text-xs leading-relaxed text-muted">
          Staff accounts are created by a county administrator. Demo: emails starting with “admin” open the
          admin console; others open the officer workspace.
        </p>
      )}
      <p className="mt-4 text-center text-xs text-muted">
        Demo tip: use the password “wrong” to preview the error state.
      </p>
    </AuthLayout>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignIn />
    </Suspense>
  );
}