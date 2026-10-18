'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeftIcon, KeyRoundIcon } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Field } from '@/components/ui';

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 4) {
      toast.error('Please enter a valid verification code');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Phone number verified successfully');
      router.push('/portal');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h2 className="mt-6 text-center text-2xl font-extrabold text-slate-900">
          Verify your phone number
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          We sent a 4-digit verification code via SMS to your registered phone.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleVerify}>
            <Field label="Verification Code" htmlFor="code">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRoundIcon className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="code"
                  type="text"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="1234"
                  className="field pl-10 h-11 text-center font-mono text-lg tracking-widest"
                />
              </div>
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary h-11 flex justify-center items-center text-base"
            >
              {loading ? 'Verifying…' : 'Verify & Continue'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-4 flex items-center justify-between text-xs font-semibold">
            <button
              type="button"
              onClick={() => toast.success('A new verification code has been sent')}
              className="text-emerald-600 hover:text-emerald-700"
            >
              Resend code
            </button>
            <Link
              href="/signin"
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" /> Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}