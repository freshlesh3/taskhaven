# Roadmap

Ordered by what unblocks the most users. Nothing here is a promise of a date.

## Now (v0.1)

- [x] Accounts, sessions, profiles, skills
- [x] Jobs with filters and search
- [x] Proposals, shortlist, hire, decline
- [x] Contracts with milestones and messaging
- [x] Simulated escrow ledger and releases
- [x] Reviews after completion
- [x] Health endpoint, tests, CI
- [x] Notifications inbox with unread counts
- [x] Admin console: hide jobs, suspend accounts, close listings
- [x] Job editing, closing and proposal withdrawal
- [x] Password change that revokes other sessions
- [x] Email verification with single-use hashed tokens
- [x] Rate limits on signup, login and verification resends
- [x] Password reset by email, with purpose-scoped tokens and session revocation
- [x] Report/flag flow feeding the admin console
- [x] Append-only audit log for privileged actions
- [x] Pagination for the talent directory

## Next (v0.2) — make it safe to run publicly

- [ ] Pagination for contracts and the admin queues
- [ ] Saved searches and job alerts

## Then (v0.3) — make it useful for teams

- [ ] Organisations: shared job ownership and billing
- [ ] File attachments on jobs, proposals and milestones
- [ ] Saved searches and alert emails
- [ ] Contract amendments (change a milestone after funding)
- [ ] Time tracking for hourly contracts
- [ ] Export a contract as PDF

## Later (v0.4+) — make it operable

- [ ] Prisma migrations instead of `db push`
- [ ] Real payment adapter (see `docs/payments.md`)
- [ ] Object storage for uploads
- [ ] Multi-currency settlement
- [ ] Accessibility audit and fixes across every page
- [ ] End-to-end tests with Playwright
- [ ] Docker image and one-click deploy templates

## Non-goals

- Real-money handling in-tree without a licensed provider.
- Copying another marketplace's design, copy or branding.
- A plugin system before the core loop is stable.
