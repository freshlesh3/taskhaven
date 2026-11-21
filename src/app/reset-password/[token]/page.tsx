import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/forms/reset-password-form';

export const metadata: Metadata = { title: 'Set a new password' };

type Params = Promise<{ token: string }>;

export default async function ResetPasswordPage({ params }: { params: Params }) {
  const { token } = await params;

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-semibold tracking-tight">Set a new password</h1>
        <p className="mt-2 text-sm text-ink-500">Choose something you have not used elsewhere.</p>
        <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}
