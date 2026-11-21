# Contributing to Taskhaven

Thanks for helping. This project tries to stay small enough to read in an afternoon, so please keep changes
proportional to the problem.

## Before you start

- For anything larger than a bug fix, open an issue first and describe the user-visible outcome.
- Check `docs/roadmap.md` — some things are intentionally not built yet.

## Local development

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

Before pushing, run all three gates:

```bash
npm run typecheck
npm test
npm run build
```

## Pull requests

1. Branch from `main` (`feat/short-name`, `fix/short-name`).
2. Keep the diff focused; unrelated refactors go in their own PR.
3. Use conventional commit subjects (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
4. Add or update tests for money, validation, and any pure logic.
5. For UI changes, include before/after screenshots.

## Code conventions

- TypeScript strict mode. Avoid `any`; if it is unavoidable, explain why in a comment.
- Mutations live in `src/server/actions` and must validate with Zod, check the session, check ownership, then
  revalidate the affected paths.
- Authorisation belongs in the server action, never only in the UI.
- Money is an integer number of cents. Format it at the edge with `src/lib/money.ts`.
- Prefer server components; add `'use client'` only where interactivity requires it.
- Keep accessible markup: labelled inputs, real buttons, visible focus, colour contrast.

## Data and migrations

The schema lives in `prisma/schema.prisma`. For this early phase we use `prisma db push` rather than migration
files; once the schema stabilises we will move to `prisma migrate`. If you change the schema, update the seed so a
fresh clone still demos the full loop.

## Reporting bugs

Include the page, steps to reproduce, expected vs actual, and your Node version. For data problems, say whether
the database was seeded fresh.
