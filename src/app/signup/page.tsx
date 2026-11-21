import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SignupForm } from '@/components/forms/signup-form';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Sign up' };

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect('/dashboard');

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight">Join Taskhaven</h1>
        <p className="mt-2 text-sm text-ink-500">
          One account works for both sides of the marketplace — hire, work, or do both.
        </p>

        <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
