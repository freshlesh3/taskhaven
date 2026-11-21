'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { recordAudit } from '@/lib/audit';

async function requireAdmin() {
  const user = await requireUser('/admin');
  if (user.role !== 'ADMIN') redirect('/dashboard?error=admins-only');
  return user;
}

export async function hideJobAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const jobId = String(formData.get('jobId') ?? '');
  const hidden = String(formData.get('hidden') ?? 'true') === 'true';
  if (!jobId) redirect('/admin');

  await db.job.update({ where: { id: jobId }, data: { isHidden: hidden } });
  await recordAudit({
    actorId: admin.id,
    action: hidden ? 'JOB_HIDDEN' : 'JOB_UNHIDDEN',
    targetType: 'JOB',
    targetId: jobId,
  });

  revalidatePath('/admin');
  revalidatePath('/jobs');
  revalidatePath(`/jobs/${jobId}`);
}

export async function suspendUserAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
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
  await recordAudit({
    actorId: admin.id,
    action: suspended ? 'USER_SUSPENDED' : 'USER_REINSTATED',
    targetType: 'USER',
    targetId: userId,
    detail: target.email,
  });

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

  if (user.role === 'ADMIN' && job.clientId !== user.id) {
    await recordAudit({
      actorId: user.id,
      action: nextStatus === 'CLOSED' ? 'JOB_CLOSED' : 'JOB_REOPENED',
      targetType: 'JOB',
      targetId: jobId,
      detail: 'Closed from the moderation console',
    });
  }

  revalidatePath('/dashboard/jobs');
  revalidatePath('/jobs');
  revalidatePath(`/jobs/${jobId}`);
}

export async function resolveReportAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const reportId = String(formData.get('reportId') ?? '');
  const outcome = String(formData.get('outcome') ?? 'RESOLVED');
  const alsoAct = String(formData.get('alsoAct') ?? 'none');

  const report = await db.report.findUnique({ where: { id: reportId } });
  if (!report) redirect('/admin/reports');
  if (report.status !== 'OPEN') redirect('/admin/reports');

  if (alsoAct === 'hide' && report.targetType === 'JOB') {
    await db.job.update({ where: { id: report.targetId }, data: { isHidden: true } }).catch(() => {});
    await recordAudit({
      actorId: admin.id,
      action: 'JOB_HIDDEN',
      targetType: 'JOB',
      targetId: report.targetId,
      detail: `From report ${report.id}`,
    });
  }

  if (alsoAct === 'suspend' && report.targetType === 'USER') {
    await db.user.update({ where: { id: report.targetId }, data: { isSuspended: true } }).catch(() => {});
    await db.session.deleteMany({ where: { userId: report.targetId } });
    await recordAudit({
      actorId: admin.id,
      action: 'USER_SUSPENDED',
      targetType: 'USER',
      targetId: report.targetId,
      detail: `From report ${report.id}`,
    });
  }

  await db.report.update({
    where: { id: reportId },
    data: {
      status: outcome === 'DISMISSED' ? 'DISMISSED' : 'RESOLVED',
      resolvedAt: new Date(),
      resolvedById: admin.id,
    },
  });

  await recordAudit({
    actorId: admin.id,
    action: outcome === 'DISMISSED' ? 'REPORT_DISMISSED' : 'REPORT_RESOLVED',
    targetType: 'REPORT',
    targetId: reportId,
    detail: `${report.targetType}:${report.targetId} · ${report.reason}`,
  });

  revalidatePath('/admin/reports');
  revalidatePath('/admin');
  revalidatePath('/jobs');
}
