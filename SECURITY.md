# Security policy

## Reporting a vulnerability

Please **do not** open a public issue. Email the maintainers with:

- a description of the issue and its impact,
- reproduction steps or a proof of concept,
- the commit or version affected.

We aim to acknowledge within a few days, agree a disclosure timeline, and credit reporters who want it.

## What this build assumes

- Passwords are hashed with bcrypt (cost 10); sessions are random 32-byte tokens stored as SHA-256 hashes.
- Session cookies are `httpOnly`, `sameSite=lax`, and `secure` in production.
- Email verification and password reset use single-use, SHA-256-hashed tokens with purpose checks and expiry
  (24 hours / 1 hour); posting a job or sending a proposal requires a verified address.
- Signup, login, verification resends and reset requests are rate limited per client address and per account.
- Resetting a password signs out every session.
- Every mutating server action validates input, resolves the signed-in user, and checks ownership.
- Payments are simulated: no card data is collected, stored or transmitted.
- No file uploads, so there is no upload surface to attack.

## Known gaps before public deployment

- Rate limiting is in-process; run a single instance or back it with Redis behind a load balancer.
- No CSRF token beyond Next.js server-action origin checks.
- Seed accounts share a known password — remove or rotate them.
- Run behind HTTPS and a reverse proxy, and forward `x-forwarded-for` so limits see real clients.
- Back up the database; cascading deletes are enabled for account removal.
