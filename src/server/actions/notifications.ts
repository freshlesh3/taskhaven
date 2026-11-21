'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function markAllNotificationsReadAction(): Promise<void> {
  const user = await requireUser('/notifications');
  await db.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
  revalidatePath('/notifications');
  revalidatePath('/', 'layout');
}

export async function markNotificationReadAction(formData: FormData): Promise<void> {
  const user = await requireUser('/notifications');
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await db.notification.updateMany({ where: { id, userId: user.id }, data: { readAt: new Date() } });
  revalidatePath('/notifications');
  revalidatePath('/', 'layout');
}
