import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/forms/forgot-password-form';

export const metadata: Metadata = { title: 'Reset your password' };

export default function ForgotPasswordPage() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-semibold tracking-tight">Reset your password</h1>
        <p className="mt-2 text-sm text-ink-500">
          Enter the address on your account and we will send a single-use link.
        </p>
        <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
