import 'server-only';

/**
 * Email delivery.
 *
 * Out of the box Taskhaven prints messages to the server log so a fresh clone can
 * verify accounts without any provider. Set RESEND_API_KEY (and optionally
 * EMAIL_FROM) to send for real; swap `deliver` for your own provider.
 */

const FROM = process.env.EMAIL_FROM ?? 'Taskhaven <no-reply@taskhaven.local>';

type Message = { to: string; subject: string; text: string };

async function deliver({ to, subject, text }: Message): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`\n[taskhaven:email] to=${to}\n[taskhaven:email] subject=${subject}\n${text}\n`);
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, text }),
  });

  if (!response.ok) {
    // Never fail a signup because a provider hiccuped; surface it in the log.
    console.error(`[taskhaven:email] delivery failed (${response.status}): ${await response.text()}`);
  }
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}

export async function sendVerificationEmail(to: string, token: string): Promise<string> {
  const url = `${siteUrl()}/verify/${token}`;
  await deliver({
    to,
    subject: 'Confirm your Taskhaven email',
    text: [
      'Welcome to Taskhaven.',
      '',
      'Confirm your email address by opening this link:',
      url,
      '',
      'The link expires in 24 hours. If you did not create an account, ignore this message.',
    ].join('\n'),
  });
  return url;
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<string> {
  const url = `${siteUrl()}/reset-password/${token}`;
  await deliver({
    to,
    subject: 'Reset your Taskhaven password',
    text: [
      'Someone asked to reset the password for this address.',
      '',
      url,
      '',
      'The link expires in one hour. If this was not you, ignore this message.',
    ].join('\n'),
  });
  return url;
}
