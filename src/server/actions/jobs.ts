'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { jobSchema, proposalSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';

export type FormState = { error?: string; fieldErrors?: Record<string, string> } | null;

async function resolveSkillIds(names: string[] | undefined): Promise<string[]> {
  if (!names?.length) return [];
  const unique = [...new Set(names.map((name) => name.trim()).filter(Boolean))];
  const ids: string[] = [];
  for (const name of unique) {
    const slug = slugify(name);
    if (!slug) continue;
    const skill = await db.skill.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
    ids.push(skill.id);
  }
  return ids;
}

export async function createJobAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser('/jobs/new');

  const parsed = jobSchema.safeParse({
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? ''),
    category: String(formData.get('category') ?? ''),
    budgetType: String(formData.get('budgetType') ?? 'FIXED'),
    budgetMin: formData.get('budgetMin') ? Number(formData.get('budgetMin')) : null,
    budgetMax: formData.get('budgetMax') ? Number(formData.get('budgetMax')) : null,
    experience: String(formData.get('experience') ?? 'INTERMEDIATE'),
    duration: String(formData.get('duration') ?? ''),
    skills: String(formData.get('skills') ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0] ?? 'form')] = issue.message;
    }
    return { error: 'Check the highlighted fields.', fieldErrors };
  }

  const skillIds = await resolveSkillIds(parsed.data.skills);

  const job = await db.job.create({
    data: {
      clientId: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      budgetType: parsed.data.budgetType,
      budgetMin: parsed.data.budgetMin ?? null,
      budgetMax: parsed.data.budgetMax ?? null,
      experience: parsed.data.experience,
      duration: parsed.data.duration || null,
      status: 'OPEN',
      skills: { create: skillIds.map((skillId) => ({ skillId })) },
    },
  });

  revalidatePath('/jobs');
  revalidatePath('/dashboard/jobs');
  redirect(`/jobs/${job.id}`);
}

export async function submitProposalAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const jobId = String(formData.get('jobId') ?? '');
  const user = await requireUser(`/jobs/${jobId}`);

  const parsed = proposalSchema.safeParse({
    jobId,
    coverLetter: String(formData.get('coverLetter') ?? ''),
    bidAmount: Number(formData.get('bidAmount') ?? 0),
    deliveryDays: Number(formData.get('deliveryDays') ?? 0),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the proposal details.' };
  }

  const job = await db.job.findUnique({ where: { id: jobId } });
  if (!job || job.status !== 'OPEN') return { error: 'This job is no longer open.' };
  if (job.clientId === user.id) return { error: 'You cannot propose on your own job.' };

  const existing = await db.proposal.findUnique({
    where: { jobId_freelancerId: { jobId, freelancerId: user.id } },
  });

  if (existing) {
    await db.proposal.update({
      where: { id: existing.id },
      data: {
        coverLetter: parsed.data.coverLetter,
        bidAmount: parsed.data.bidAmount,
        deliveryDays: parsed.data.deliveryDays,
        status: 'SUBMITTED',
      },
    });
  } else {
    await db.proposal.create({
      data: {
        jobId,
        freelancerId: user.id,
        coverLetter: parsed.data.coverLetter,
        bidAmount: parsed.data.bidAmount,
        deliveryDays: parsed.data.deliveryDays,
      },
    });
    await db.job.update({ where: { id: jobId }, data: { proposalCount: { increment: 1 } } });
    await db.notification.create({
      data: {
        userId: job.clientId,
        kind: 'PROPOSAL',
        body: `${user.name} sent a proposal for “${job.title}”`,
        href: `/jobs/${job.id}`,
      },
    });
  }

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath('/dashboard/proposals');
  return { error: undefined };
}

export async function acceptProposalAction(formData: FormData): Promise<void> {
  const proposalId = String(formData.get('proposalId') ?? '');
  const user = await requireUser('/dashboard');

  const proposal = await db.proposal.findUnique({
    where: { id: proposalId },
    include: { job: true, freelancer: true },
  });

  if (!proposal || proposal.job.clientId !== user.id) {
    redirect('/dashboard?error=not-allowed');
  }

  const contract = await db.contract.create({
    data: {
      jobId: proposal.jobId,
      clientId: user.id,
      freelancerId: proposal.freelancerId,
      title: proposal.job.title,
      totalAmount: proposal.bidAmount,
      status: 'ACTIVE',
      milestones: {
        create: {
          title: 'Full delivery',
          description: 'Single milestone created when the proposal was accepted.',
          amount: proposal.bidAmount,
          status: 'FUNDED',
        },
      },
    },
  });

  await db.proposal.updateMany({
    where: { jobId: proposal.jobId, id: { not: proposal.id } },
    data: { status: 'DECLINED' },
  });
  await db.proposal.update({ where: { id: proposal.id }, data: { status: 'ACCEPTED' } });
  await db.job.update({ where: { id: proposal.jobId }, data: { status: 'CLOSED' } });
  await db.ledgerEntry.create({
    data: {
      userId: user.id,
      contractId: contract.id,
      kind: 'FUND',
      amount: proposal.bidAmount,
      note: 'Milestone funded at contract start (simulated)',
    },
  });
  await db.notification.create({
    data: {
      userId: proposal.freelancerId,
      kind: 'CONTRACT',
      body: `${user.name} hired you for “${proposal.job.title}”`,
      href: `/contracts/${contract.id}`,
    },
  });

  revalidatePath('/dashboard');
  redirect(`/contracts/${contract.id}`);
}

export async function declineProposalAction(formData: FormData): Promise<void> {
  const proposalId = String(formData.get('proposalId') ?? '');
  const user = await requireUser('/dashboard');
  const proposal = await db.proposal.findUnique({ where: { id: proposalId }, include: { job: true } });
  if (!proposal || proposal.job.clientId !== user.id) redirect('/dashboard?error=not-allowed');
  await db.proposal.update({ where: { id: proposalId }, data: { status: 'DECLINED' } });
  revalidatePath(`/jobs/${proposal.jobId}`);
}

export async function withdrawProposalAction(formData: FormData): Promise<void> {
  const proposalId = String(formData.get('proposalId') ?? '');
  const user = await requireUser('/dashboard/proposals');
  const proposal = await db.proposal.findUnique({ where: { id: proposalId } });
  if (!proposal || proposal.freelancerId !== user.id) redirect('/dashboard/proposals?error=not-allowed');
  if (proposal.status === 'ACCEPTED') redirect('/dashboard/proposals?error=accepted');

  await db.proposal.update({ where: { id: proposalId }, data: { status: 'WITHDRAWN' } });
  await db.job.update({ where: { id: proposal.jobId }, data: { proposalCount: { decrement: 1 } } });
  revalidatePath('/dashboard/proposals');
  revalidatePath(`/jobs/${proposal.jobId}`);
}

export async function updateJobAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const jobId = String(formData.get('jobId') ?? '');
  const user = await requireUser(`/jobs/${jobId}/edit`);

  const existing = await db.job.findUnique({ where: { id: jobId } });
  if (!existing) return { error: 'That job no longer exists.' };
  if (existing.clientId !== user.id) return { error: 'Only the job owner can edit it.' };

  const parsed = jobSchema.safeParse({
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? ''),
    category: String(formData.get('category') ?? ''),
    budgetType: String(formData.get('budgetType') ?? 'FIXED'),
    budgetMin: formData.get('budgetMin') ? Number(formData.get('budgetMin')) : null,
    budgetMax: formData.get('budgetMax') ? Number(formData.get('budgetMax')) : null,
    experience: String(formData.get('experience') ?? 'INTERMEDIATE'),
    duration: String(formData.get('duration') ?? ''),
    skills: String(formData.get('skills') ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0] ?? 'form')] = issue.message;
    }
    return { error: 'Check the highlighted fields.', fieldErrors };
  }

  const skillIds = await resolveSkillIds(parsed.data.skills);

  await db.job.update({
    where: { id: jobId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      budgetType: parsed.data.budgetType,
      budgetMin: parsed.data.budgetMin ?? null,
      budgetMax: parsed.data.budgetMax ?? null,
      experience: parsed.data.experience,
      duration: parsed.data.duration || null,
    },
  });
  await db.jobSkill.deleteMany({ where: { jobId } });
  for (const skillId of skillIds) {
    await db.jobSkill.create({ data: { jobId, skillId } });
  }

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath('/dashboard/jobs');
  redirect(`/jobs/${jobId}`);
}
