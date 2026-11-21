# Payments

> **This build is simulated.** No card is charged, no payout is made, and ledger entries are not financial records.
> Do not represent them as such to users.

## How it works today

Money is modelled as a ledger, not a balance mutation:

| Entry     | When                          | Who                    | Sign                |
| --------- | ----------------------------- | ---------------------- | ------------------- |
| `FUND`    | A milestone is created        | Client                 | Committed budget    |
| `RELEASE` | A milestone is released       | Freelancer             | Net of the fee      |
| `FEE`     | A milestone is released       | Client / platform      | 10% of the amount   |
| `REFUND`  | Reserved                      | Client                 | Not used yet        |
| `WITHDRAW`| Reserved                      | Freelancer             | Not used yet        |

`src/lib/money.ts` holds the only fee logic:

```ts
export const PLATFORM_FEE_BPS = 1000; // 10%
export function platformFee(amount: number) { … }
export function freelancerNet(amount: number) { … }
```

Releasing a milestone writes the release and the fee in one action, marks the milestone `RELEASED`, and completes the
contract when no milestones remain unreleased.

## The adapter boundary

To connect a real provider, implement an adapter with three ideas and call it from
`src/server/actions/contracts.ts`:

```ts
export interface PaymentAdapter {
  /** Authorise and hold funds for a milestone. Returns a provider reference. */
  fundMilestone(input: { contractId: string; milestoneId: string; amount: number; currency: string }): Promise<{ reference: string }>;
  /** Capture a previously authorised amount and pay the recipient. */
  releaseMilestone(input: { reference: string; amount: number }): Promise<{ transferId: string }>;
  /** Release an authorisation without capture. */
  voidMilestone(input: { reference: string }): Promise<void>;
}
```

Rules that matter more than the provider choice:

1. **Store provider references** on the milestone (add `providerRef String?`) so retries are idempotent.
2. **Trust webhooks, not the browser.** Mark funding and release complete from the provider's event, then revalidate.
3. **Never derive balances by summing the ledger at read time in a hot path** once volume grows; keep a materialised
   balance per user updated in the same transaction as the ledger entry.
4. **Model the fee as a separate line** (as this build does) so accounting and refunds stay comprehensible.
5. **Refunds**: reverse both the `RELEASE` and the `FEE` entries rather than editing history.

## Compliance notes

Handling real money usually implies KYC, sanctions screening, tax reporting and a licensed payment partner. Those are
product and legal decisions outside this repository; the goal here is only to keep the code shaped so they can be
added without rewriting the marketplace.
