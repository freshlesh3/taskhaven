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

## Next (v0.2) — make it safe to run publicly

- [ ] Email verification and password reset
- [ ] Signup and login rate limiting
- [ ] Admin/moderation surface: hide jobs, suspend accounts, review reports
- [ ] Notification inbox page (records exist; only counts are shown)
- [ ] Pagination for talent and contracts
- [ ] Structured audit log for privileged actions

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
