/**
 * Development smoke check for password-reset tokens.
 *
 *   npx tsx scripts/check-reset.ts
 */
import { PrismaClient } from '@prisma/client';
import { consumeToken, createToken } from '../src/lib/verification';

const db = new PrismaClient();

async function main() {
  const stamp = Date.now();
  const user = await db.user.create({
    data: {
      email: `reset-check-${stamp}@taskhaven.local`,
      name: 'Reset Check',
      handle: `reset-check-${stamp}`,
      passwordHash: 'not-a-real-hash',
      emailVerifiedAt: new Date(),
    },
  });

  const token = await createToken(user.id, 'PASSWORD_RESET');

  const wrongPurpose = await consumeToken(token, 'EMAIL_VERIFICATION');
  if (wrongPurpose.ok || wrongPurpose.reason !== 'wrong-purpose') {
    throw new Error('a reset token was accepted as a verification token');
  }

  const first = await consumeToken(token, 'PASSWORD_RESET');
  if (!first.ok) throw new Error(`reset consume failed: ${first.reason}`);

  const replay = await consumeToken(token, 'PASSWORD_RESET');
  if (replay.ok || replay.reason !== 'used') throw new Error('reset token was replayable');

  const expiredToken = await createToken(user.id, 'PASSWORD_RESET');
  await db.verificationToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { expiresAt: new Date(Date.now() - 1000) },
  });
  const expired = await consumeToken(expiredToken, 'PASSWORD_RESET');
  if (expired.ok || expired.reason !== 'expired') throw new Error('expired token was accepted');

  await db.user.delete({ where: { id: user.id } });
  console.log('password reset: purpose checked, single use, expiry enforced');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
