/**
 * Development helper: creates a session token for a seeded account so scripts and
 * screenshots can act as that user without going through the login form.
 *
 * It needs direct database access (i.e. operator rights) and refuses to run unless
 * ALLOW_SESSION_HELPER=1 is set, so it cannot be triggered by a remote request.
 *
 *   ALLOW_SESSION_HELPER=1 node scripts/make-session.mjs mara@taskhaven.dev
 *
 * Prints the raw token. Pass it as `Cookie: th_session=<token>`.
 */
import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';

if (process.env.ALLOW_SESSION_HELPER !== '1') {
  console.error('Refusing to mint a session. Set ALLOW_SESSION_HELPER=1 for local development.');
  process.exit(1);
}

const db = new PrismaClient();
const token = randomBytes(32).toString('base64url');
const tokenHash = createHash('sha256').update(token).digest('hex');

const email = process.argv[2] ?? 'admin@taskhaven.dev';
const user = await db.user.findUnique({ where: { email } });
if (!user) {
  console.error(`No account for ${email}. Run: npm run db:seed`);
  process.exit(1);
}

await db.session.deleteMany({ where: { userId: user.id } });
await db.session.create({
  data: {
    tokenHash,
    userId: user.id,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    userAgent: 'session-helper',
  },
});

console.log(token);
await db.$disconnect();
