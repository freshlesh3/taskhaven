/**
 * Development smoke check for the email-verification flow.
 *
 * Creates a throwaway unverified account, mints a token, consumes it twice and
 * asserts the first attempt verifies the user while the second is rejected.
 *
 *   npx tsx scripts/check-verification.ts
 */
import { PrismaClient } from '@prisma/client';
import { consumeVerificationToken, createVerificationToken } from '../src/lib/verification';

const db = new PrismaClient();

async function main() {
  const email = 'verify-check@taskhaven.local';
  await db.user.deleteMany({ where: { email } });

  const user = await db.user.create({
    data: {
      email,
      name: 'Verify Check',
      handle: `verify-check-${Date.now()}`,
      passwordHash: 'not-a-real-hash',
      role: 'FREELANCER',
    },
  });

  if (user.emailVerifiedAt) throw new Error('new user should start unverified');

  const token = await createVerificationToken(user.id);
  const first = await consumeVerificationToken(token);
  if (!first.ok) throw new Error(`first consume failed: ${first.reason}`);

  const after = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!after.emailVerifiedAt) throw new Error('user was not marked verified');

  const second = await consumeVerificationToken(token);
  if (second.ok || second.reason !== 'used') throw new Error('token was replayable');

  const unknown = await consumeVerificationToken('not-a-token');
  if (unknown.ok || unknown.reason !== 'invalid') throw new Error('unknown token accepted');

  await db.user.delete({ where: { id: user.id } });
  console.log('email verification: first use verifies, replay rejected, unknown rejected');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
