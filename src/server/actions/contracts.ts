'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { messageSchema, milestoneSchema, reviewSchema } from '@/lib/validation';
import { freelancerNet, platformFee } from '@/lib/money';
import type { FormState } from './jobs';

async function contractForUser(contractId: string, userId: string) {
  const contract = await db.contract.findUnique({
    where: { id: contractId },
    include: { client: true, freelancer: true, milestones: true },
  });
  if (!contract) return null;
  if (contract.clientId !== userId && contract.freelancerId !== userId) return null;
  return contract;
}

export async function sendMessageAction(formData: FormData): Promise<void> {
  const contractId = String(formData.get('contractId') ?? '');
  const user = await requireUser(`/contracts/${contractId}`);

  const parsed = messageSchema.safeParse({
    contractId,
    body: String(formData.get('body') ?? ''),
  });
  if (!parsed.success) redirect(`/contracts/${contractId}`);

  const contract = await contractForUser(contractId, user.id);
  if (!contract) redirect('/dashboard');

  await db.message.create({
    data: { contractId, senderId: user.id, body: parsed.data.body },
  });

  const recipientId = contract.clientId === user.id ? contract.freelancerId : contract.clientId;
  await db.notification.create({
    data: {
      userId: recipientId,
      kind: 'MESSAGE',
      body: `${user.name} sent a message on “${contract.title}”`,
      href: `/contracts/${contractId}`,
    },
  });

  revalidatePath(`/contracts/${contractId}`);
}

export async function addMilestoneAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const contractId = String(formData.get('contractId') ?? '');
  const user = await requireUser(`/contracts/${contractId}`);

  const parsed = milestoneSchema.safeParse({
    contractId,
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? ''),
    amount: Number(formData.get('amount') ?? 0),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the milestone.' };

  const contract = await contractForUser(contractId, user.id);
  if (!contract || contract.clientId !== user.id) return { error: 'Only the client can add milestones.' };

  await db.milestone.create({
    data: {
      contractId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      amount: parsed.data.amount,
      status: 'FUNDED',
    },
  });
  await db.ledgerEntry.create({
    data: { userId: user.id, contractId, kind: 'FUND', amount: parsed.data.amount, note: 'Milestone funded (simulated)' },
  });

  revalidatePath(`/contracts/${contractId}`);
  return { error: undefined };
}

export async function submitMilestoneAction(formData: FormData): Promise<void> {
  const milestoneId = String(formData.get('milestoneId') ?? '');
  const user = await requireUser('/dashboard');

  const milestone = await db.milestone.findUnique({ where: { id: milestoneId }, include: { contract: true } });
  if (!milestone) redirect('/dashboard');
  if (milestone.contract.freelancerId !== user.id) redirect('/dashboard?error=not-allowed');

  await db.milestone.update({ where: { id: milestoneId }, data: { status: 'SUBMITTED' } });
  await db.notification.create({
    data: {
      userId: milestone.contract.clientId,
      kind: 'MILESTONE',
      body: `A milestone was submitted for review on “${milestone.contract.title}”`,
      href: `/contracts/${milestone.contractId}`,
    },
  });
  revalidatePath(`/contracts/${milestone.contractId}`);
}

export async function releaseMilestoneAction(formData: FormData): Promise<void> {
  const milestoneId = String(formData.get('milestoneId') ?? '');
  const user = await requireUser('/dashboard');

  const milestone = await db.milestone.findUnique({ where: { id: milestoneId }, include: { contract: true } });
  if (!milestone) redirect('/dashboard');
  if (milestone.contract.clientId !== user.id) redirect('/dashboard?error=not-allowed');
  if (milestone.status === 'RELEASED') redirect(`/contracts/${milestone.contractId}`);

  const fee = platformFee(milestone.amount);
  const net = freelancerNet(milestone.amount);

  await db.milestone.update({
    where: { id: milestoneId },
    data: { status: 'RELEASED', releasedAt: new Date() },
  });

  await db.ledgerEntry.createMany({
    data: [
      {
        userId: milestone.contract.freelancerId,
        contractId: milestone.contractId,
        kind: 'RELEASE',
        amount: net,
        note: `Milestone released: ${milestone.title}`,
      },
      {
        userId: user.id,
        contractId: milestone.contractId,
        kind: 'FEE',
        amount: fee,
        note: 'Platform fee (10%, simulated)',
      },
    ],
  });

  const remaining = await db.milestone.count({
    where: { contractId: milestone.contractId, status: { not: 'RELEASED' } },
  });
  if (remaining === 0) {
    await db.contract.update({
      where: { id: milestone.contractId },
      data: { status: 'COMPLETED', endedAt: new Date() },
    });
  }

  await db.notification.create({
    data: {
      userId: milestone.contract.freelancerId,
      kind: 'PAYMENT',
      body: `You were paid for “${milestone.title}”`,
      href: `/contracts/${milestone.contractId}`,
    },
  });

  revalidatePath(`/contracts/${milestone.contractId}`);
}

export async function completeContractAction(formData: FormData): Promise<void> {
  const contractId = String(formData.get('contractId') ?? '');
  const user = await requireUser(`/contracts/${contractId}`);
  const contract = await contractForUser(contractId, user.id);
  if (!contract) redirect('/dashboard');

  await db.contract.update({ where: { id: contractId }, data: { status: 'COMPLETED', endedAt: new Date() } });
  revalidatePath(`/contracts/${contractId}`);
}

export async function reviewAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const contractId = String(formData.get('contractId') ?? '');
  const user = await requireUser(`/contracts/${contractId}`);

  const parsed = reviewSchema.safeParse({
    contractId,
    rating: Number(formData.get('rating') ?? 0),
    comment: String(formData.get('comment') ?? ''),
  });
  if (!parsed.success) return { error: 'Choose a rating between 1 and 5.' };

  const contract = await contractForUser(contractId, user.id);
  if (!contract) return { error: 'You are not part of this contract.' };

  const subjectId = contract.clientId === user.id ? contract.freelancerId : contract.clientId;
  const existing = await db.review.findUnique({ where: { contractId } });
  if (existing) return { error: 'A review already exists for this contract.' };

  await db.review.create({
    data: {
      contractId,
      authorId: user.id,
      subjectId,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    },
  });

  revalidatePath(`/contracts/${contractId}`);
  revalidatePath(`/talent/${contract.clientId === user.id ? contract.freelancer.handle : contract.client.handle}`);
  return { error: undefined };
}
