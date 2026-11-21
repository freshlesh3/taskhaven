'use server';

import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { reportSchema } from '@/lib/validation';

export type ReportState = { sent?: boolean; error?: string } | null;

const REPORT_LIMIT = { max: 5, windowMs: 24 * 60 * 60 * 1000 };

export async function createReportAction(_prev: ReportState, formData: FormData): Promise<ReportState> {
  const targetType = String(formData.get('targetType') ?? 'JOB');
  const targetId = String(formData.get('targetId') ?? '');
  const user = await requireUser(targetType === 'JOB' ? `/jobs/${targetId}` : '/talent');

  if (!user.emailVerifiedAt) {
    return { error: 'Confirm your email address before reporting anything.' };
  }

  const gate = rateLimit(`report:${user.id}`, REPORT_LIMIT.max, REPORT_LIMIT.windowMs);
  if (!gate.allowed) return { error: 'You have sent several reports today. Try again tomorrow.' };

  const parsed = reportSchema.safeParse({
    targetType,
    targetId,
    reason: String(formData.get('reason') ?? ''),
    details: String(formData.get('details') ?? ''),
  });
  if (!parsed.success) return { error: 'Choose a reason for the report.' };

  if (parsed.data.targetType === 'JOB') {
    const job = await db.job.findUnique({ where: { id: parsed.data.targetId } });
    if (!job) return { error: 'That job no longer exists.' };
    if (job.clientId === user.id) return { error: 'You cannot report your own job.' };
  } else {
    const target = await db.user.findUnique({ where: { id: parsed.data.targetId } });
    if (!target) return { error: 'That profile no longer exists.' };
    if (target.id === user.id) return { error: 'You cannot report yourself.' };
  }

  const duplicate = await db.report.findFirst({
    where: {
      reporterId: user.id,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      status: 'OPEN',
    },
  });
  if (duplicate) return { sent: true };

  await db.report.create({
    data: {
      reporterId: user.id,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      reason: parsed.data.reason,
      details: parsed.data.details || null,
    },
  });

  const admins = await db.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
  if (admins.length) {
    await db.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        kind: 'REPORT',
        body: `New ${parsed.data.reason.toLowerCase().replace('_', ' ')} report from ${user.name}`,
        href: '/admin/reports',
      })),
    });
  }

  return { sent: true };
}
