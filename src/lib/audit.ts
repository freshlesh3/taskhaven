import 'server-only';
import { db } from './db';

export type AuditAction =
  | 'JOB_HIDDEN'
  | 'JOB_UNHIDDEN'
  | 'JOB_CLOSED'
  | 'JOB_REOPENED'
  | 'USER_SUSPENDED'
  | 'USER_REINSTATED'
  | 'REPORT_RESOLVED'
  | 'REPORT_DISMISSED';

/** Append-only audit trail for privileged actions. Never throws into the caller. */
export async function recordAudit(input: {
  actorId: string;
  action: AuditAction;
  targetType: 'JOB' | 'USER' | 'REPORT';
  targetId: string;
  detail?: string;
}): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        detail: input.detail ?? null,
      },
    });
  } catch (error) {
    console.error('[taskhaven:audit] failed to record', input.action, error);
  }
}
