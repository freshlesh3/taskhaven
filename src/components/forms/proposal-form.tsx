'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/input';
import { submitProposalAction, type FormState } from '@/server/actions/jobs';

export function ProposalForm({ jobId, suggestedBid }: { jobId: string; suggestedBid?: number }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(submitProposalAction, null);

  if (state && !state.error && !state.fieldErrors) {
    return (
      <div className="rounded-xl bg-brand-50 p-5 text-sm text-brand-900">
        Proposal sent. You can revise it any time before the client hires.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="jobId" value={jobId} />

      <Field label="Cover letter" htmlFor="coverLetter">
        <Textarea
          id="coverLetter"
          name="coverLetter"
          rows={6}
          placeholder="Explain how you would approach this work, what you have shipped before, and anything you need from the client."
          required
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your bid (USD)" htmlFor="bidAmount">
          <Input
            id="bidAmount"
            name="bidAmount"
            type="number"
            min={1}
            step={1}
            defaultValue={suggestedBid ? Math.round(suggestedBid / 100) : undefined}
            required
          />
        </Field>
        <Field label="Delivery time (days)" htmlFor="deliveryDays">
          <Input id="deliveryDays" name="deliveryDays" type="number" min={1} max={365} defaultValue={14} required />
        </Field>
      </div>

      {state?.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Sending…' : 'Send proposal'}
      </Button>
      <p className="text-xs text-ink-500">You are charged nothing to apply. Taskhaven takes 10% when a milestone is released.</p>
    </form>
  );
}
