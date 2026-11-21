'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';

async function requireAdmin() {
  const user = await requireUser('/admin');
  if (user.role !== 'ADMIN') redirect('/dashboard?error=admins-only');
  return user;
}

export async function hideJobAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const jobId = String(formData.get('jobId') ?? '');
  const hidden = String(formData.get('hidden') ?? 'true') === 'true';
  if (!jobId) redirect('/admin');

  await db.job.update({ where: { id: jobId }, data: { isHidden: hidden } });
  revalidatePath('/admin');
  revalidatePath('/jobs');
  revalidatePath(`/jobs/${jobId}`);
}

export async function suspendUserAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const userId = String(formData.get('userId') ?? '');
  const suspended = String(formData.get('suspended') ?? 'true') === 'true';
  if (!userId) redirect('/admin');

  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) redirect('/admin');
  if (target.role === 'ADMIN') redirect('/admin?error=cannot-suspend-admin');

  await db.user.update({ where: { id: userId }, data: { isSuspended: suspended, isAvailable: !suspended } });
  if (suspended) {
    await db.session.deleteMany({ where: { userId } });
  }

  revalidatePath('/admin');
  revalidatePath('/talent');
  revalidatePath(`/talent/${target.handle}`);
}

export async function closeJobAction(formData: FormData): Promise<void> {
  const user = await requireUser('/dashboard/jobs');
  const jobId = String(formData.get('jobId') ?? '');
  const job = await db.job.findUnique({ where: { id: jobId } });
  if (!job) redirect('/dashboard/jobs');
  if (job.clientId !== user.id && user.role !== 'ADMIN') redirect('/dashboard/jobs?error=not-allowed');

  const nextStatus = String(formData.get('status') ?? (job.status === 'OPEN' ? 'CLOSED' : 'OPEN'));
  await db.job.update({ where: { id: jobId }, data: { status: nextStatus } });

  revalidatePath('/dashboard/jobs');
  revalidatePath('/jobs');
  revalidatePath(`/jobs/${jobId}`);
}
