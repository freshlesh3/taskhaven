import { Button } from '@/components/ui/button';
import { acceptProposalAction, declineProposalAction } from '@/server/actions/jobs';

export function ProposalActions({ proposalId }: { proposalId: string }) {
  return (
    <div className="flex gap-2">
      <form action={acceptProposalAction}>
        <input type="hidden" name="proposalId" value={proposalId} />
        <Button type="submit" size="sm">
          Hire and start contract
        </Button>
      </form>
      <form action={declineProposalAction}>
        <input type="hidden" name="proposalId" value={proposalId} />
        <Button type="submit" size="sm" variant="outline">
          Decline
        </Button>
      </form>
    </div>
  );
}
