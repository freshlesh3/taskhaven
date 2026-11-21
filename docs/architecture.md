# Architecture

## Shape

Taskhaven is a single Next.js (App Router) application with a Prisma data layer. There is no separate API service:
pages are server components that read through Prisma, and mutations are server actions colocated in
`src/server/actions`.

```
Browser ──▶ Server Component ──▶ Prisma ──▶ SQLite / PostgreSQL
   │                ▲
   └── Server Action┘ (validate → authorise → mutate → revalidate)
```

This keeps the whole request path readable in one repository and avoids duplicating DTOs across a network boundary.
If you need a public API later, the queries in `src/server/queries.ts` are the seam to lift into route handlers.

## Data model

| Model          | Purpose                                                              |
| -------------- | -------------------------------------------------------------------- |
| `User`         | Account, profile, role (`FREELANCER` / `CLIENT` / `ADMIN`)           |
| `Session`      | Hashed session token, expiry, user agent                             |
| `Skill`        | Normalised skill taxonomy, shared by users and jobs                  |
| `UserSkill`    | Join table with a level                                              |
| `Job`          | Brief, category, budget type/range, experience, status               |
| `JobSkill`     | Join table for required skills                                       |
| `Proposal`     | Cover letter, bid, delivery days, status                             |
| `Contract`     | Created on hire; joins client, freelancer and (optionally) the job   |
| `Milestone`    | Amount, status (`FUNDED → IN_PROGRESS → SUBMITTED → RELEASED`)       |
| `Message`      | Contract-scoped thread                                               |
| `LedgerEntry`  | `FUND`, `RELEASE`, `FEE`, `REFUND`, `WITHDRAW` — the money trail      |
| `Review`       | One per contract, written by either party                            |
| `Notification` | In-app notifications with an optional deep link                      |

Amounts are integers in minor units (cents). Currency is stored on the contract and defaults to USD.

## Authorisation

Every mutating action follows the same order:

1. `requireUser()` — resolves the session or redirects to `/login?next=…`.
2. Parse `FormData` with a Zod schema.
3. Load the target row and assert the caller is a participant or owner.
4. Mutate, then `revalidatePath()` the pages that render the change.

Reads that expose private data (contracts, dashboards) also check participation server-side and `notFound()` rather
than returning a 403 that leaks existence.

## Auth

`src/lib/auth.ts` implements cookie sessions directly:

- `createSession(userId)` — 32 random bytes, base64url token in an `httpOnly` cookie; only the SHA-256 hash is stored.
- `getCurrentUser()` — memoised per request with React `cache`, joins the session and user, deletes expired rows.
- `destroySession()` — deletes the row and clears the cookie.

No third-party identity provider is required, which keeps self-hosting trivial and the flow auditable. Adding OAuth
later means mapping an external identity onto `User` and calling `createSession`.

## Rendering and caching

- Pages are dynamic (they read cookies for the header), so there is no stale personalised markup.
- Mutations call `revalidatePath` for exactly the paths they affect.
- The marketing pages are plain server components with no client JavaScript beyond interactive forms.

## Failure modes

- `/api/health` returns 503 when the database is unreachable; it does not throw.
- Actions return `{ error }` for validation and authorisation problems and re-render the form with the message.
- `notFound()` is used for missing or inaccessible resources so 404s stay honest.

## Extending

- **New entity** — add the model, a query in `queries.ts`, an action module, then the route.
- **New fee rule** — `src/lib/money.ts` is the only place that decides what the platform keeps.
- **Real payments** — see `docs/payments.md` for the adapter boundary.
