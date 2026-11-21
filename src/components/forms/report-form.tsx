'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Select, Textarea } from '@/components/ui/input';
import { REPORT_REASONS } from '@/lib/constants';
import { createReportAction, type ReportState } from '@/server/actions/reports';

export function ReportForm({
  targetType,
  targetId,
  label,
}: {
  targetType: 'JOB' | 'USER';
  targetId: string;
  label: string;
}) {
  const [state, formAction, pending] = useActionState<ReportState, FormData>(createReportAction, null);

  if (state?.sent) {
    return (
      <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs leading-5 text-brand-900">
        Thanks — a moderator will review this. You can keep working in the meantime.
      </p>
    );
  }

  return (
    <details className="rounded-lg border border-ink-100 p-3">
      <summary className="cursor-pointer text-xs font-medium text-ink-700">{label}</summary>
      <form action={formAction} className="mt-3 space-y-3">
        <input type="hidden" name="targetType" value={targetType} />
        <input type="hidden" name="targetId" value={targetId} />

        <Field label="Reason" htmlFor={`reason-${targetId}`}>
          <Select id={`reason-${targetId}`} name="reason" defaultValue="SPAM">
            {REPORT_REASONS.map((reason) => (
              <option key={reason.value} value={reason.value}>
                {reason.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="What happened?" htmlFor={`details-${targetId}`} hint="Optional, but it helps.">
          <Textarea id={`details-${targetId}`} name="details" rows={3} maxLength={1000} />
        </Field>

        {state?.error ? <p className="text-xs font-medium text-red-600">{state.error}</p> : null}

        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          {pending ? 'Sending…' : 'Send report'}
        </Button>
      </form>
    </details>
  );
}
