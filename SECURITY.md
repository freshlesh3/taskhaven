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
- Every mutating server action validates input, resolves the signed-in user, and checks ownership.
- Payments are simulated: no card data is collected, stored or transmitted.
- No file uploads, so there is no upload surface to attack.

## Known gaps before public deployment

- No email verification, password reset, or signup rate limiting.
- No CSRF token beyond Next.js server-action origin checks.
- Seed accounts share a known password — remove or rotate them.
- Run behind HTTPS and a reverse proxy with request-size and rate limits.
- Back up the database; cascading deletes are enabled for account removal.
