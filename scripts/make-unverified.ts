/**
 * Development helper: creates an unverified account and prints `email token` so a
 * shell can exercise the verification pages.
 *
 *   ALLOW_SESSION_HELPER=1 npx tsx scripts/make-unverified.ts
 */
import { PrismaClient } from '@prisma/client';
import { createVerificationToken } from '../src/lib/verification';

async function main() {
  if (process.env.ALLOW_SESSION_HELPER !== '1') {
    console.error('Refusing to run without ALLOW_SESSION_HELPER=1.');
    process.exit(1);
  }

  const db = new PrismaClient();
  const stamp = Date.now();
  const email = `unverified-${stamp}@taskhaven.local`;

  const user = await db.user.create({
    data: {
      email,
      name: 'Unverified Tester',
      handle: `unverified-${stamp}`,
      passwordHash: 'not-a-real-hash',
      role: 'CLIENT',
    },
  });

  const token = await createVerificationToken(user.id);
  console.log(`${email} ${token}`);
  await db.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
