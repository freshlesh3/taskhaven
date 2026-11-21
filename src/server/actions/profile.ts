'use server';

import { revalidatePath } from 'next/cache';
import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/password';
import { profileSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import type { FormState } from './jobs';

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser('/dashboard/profile');

  const parsed = profileSchema.safeParse({
    name: String(formData.get('name') ?? ''),
    headline: String(formData.get('headline') ?? ''),
    bio: String(formData.get('bio') ?? ''),
    country: String(formData.get('country') ?? ''),
    hourlyRate: formData.get('hourlyRate') ? Number(formData.get('hourlyRate')) : null,
    isAvailable: formData.get('isAvailable') === 'on',
    skills: String(formData.get('skills') ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the profile fields.' };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      headline: parsed.data.headline || null,
      bio: parsed.data.bio || null,
      country: parsed.data.country || null,
      hourlyRate: parsed.data.hourlyRate ?? null,
      isAvailable: parsed.data.isAvailable ?? true,
    },
  });

  const skillNames = [...new Set(parsed.data.skills ?? [])];
  const skillIds: string[] = [];
  for (const name of skillNames) {
    const slug = slugify(name);
    if (!slug) continue;
    const skill = await db.skill.upsert({ where: { slug }, update: { name }, create: { name, slug } });
    skillIds.push(skill.id);
  }

  await db.userSkill.deleteMany({ where: { userId: user.id } });
  for (const skillId of skillIds) {
    await db.userSkill.create({ data: { userId: user.id, skillId } });
  }

  revalidatePath('/dashboard/profile');
  revalidatePath(`/talent/${user.handle}`);
  return { error: undefined };
}

export async function updateRoleAction(formData: FormData): Promise<void> {
  const user = await requireUser('/dashboard/settings');
  const role = String(formData.get('role') ?? 'FREELANCER');
  if (!['FREELANCER', 'CLIENT'].includes(role)) return;
  await db.user.update({ where: { id: user.id }, data: { role } });
  revalidatePath('/dashboard');
}

export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser('/dashboard/settings');
  const current = String(formData.get('currentPassword') ?? '');
  const next = String(formData.get('newPassword') ?? '');
  const confirm = String(formData.get('confirmPassword') ?? '');

  if (!(await verifyPassword(current, user.passwordHash))) {
    return { error: 'Your current password is not correct.' };
  }
  if (next.length < 8) return { error: 'Use at least 8 characters.' };
  if (next !== confirm) return { error: 'The new passwords do not match.' };

  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next) } });
  // Sign out other sessions so a leaked token cannot outlive the change.
  const store = await cookies();
  const token = store.get('th_session')?.value;
  if (token) {
    const keep = createHash('sha256').update(token).digest('hex');
    await db.session.deleteMany({ where: { userId: user.id, tokenHash: { not: keep } } });
  }
  return { error: undefined };
}
