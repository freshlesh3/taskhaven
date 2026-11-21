import 'server-only';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';

export type JobFilters = {
  q?: string;
  category?: string;
  budgetType?: string;
  experience?: string;
  page?: number;
  perPage?: number;
};

export async function listJobs(filters: JobFilters = {}) {
  const perPage = filters.perPage ?? 12;
  const page = Math.max(1, filters.page ?? 1);

  const where: Prisma.JobWhereInput = {
    status: 'OPEN',
    visibility: 'PUBLIC',
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.budgetType ? { budgetType: filters.budgetType } : {}),
    ...(filters.experience ? { experience: filters.experience } : {}),
    ...(filters.q
      ? {
          OR: [
            { title: { contains: filters.q } },
            { description: { contains: filters.q } },
            { skills: { some: { skill: { name: { contains: filters.q } } } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        client: { select: { id: true, name: true, handle: true, country: true, avatarHue: true } },
        skills: { include: { skill: true } },
      },
    }),
    db.job.count({ where }),
  ]);

  return { items, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getJob(id: string) {
  return db.job.findUnique({
    where: { id },
    include: {
      client: true,
      skills: { include: { skill: true } },
      proposals: {
        orderBy: { createdAt: 'asc' },
        include: { freelancer: true },
      },
      contracts: { select: { id: true, status: true } },
    },
  });
}

export async function listTalent(filters: { q?: string; skill?: string; available?: boolean } = {}) {
  const where: Prisma.UserWhereInput = {
    isPublic: true,
    role: { in: ['FREELANCER', 'CLIENT'] },
    ...(filters.available ? { isAvailable: true } : {}),
    ...(filters.q
      ? {
          OR: [
            { name: { contains: filters.q } },
            { headline: { contains: filters.q } },
            { bio: { contains: filters.q } },
            { skills: { some: { skill: { name: { contains: filters.q } } } } },
          ],
        }
      : {}),
    ...(filters.skill ? { skills: { some: { skill: { slug: filters.skill } } } } : {}),
  };

  return db.user.findMany({
    where,
    orderBy: [{ isAvailable: 'desc' }, { createdAt: 'asc' }],
    take: 48,
    include: {
      skills: { include: { skill: true } },
      reviewsReceived: { select: { rating: true } },
      contractsWork: { where: { status: 'COMPLETED' }, select: { id: true } },
    },
  });
}

export async function getUserByHandle(handle: string) {
  return db.user.findUnique({
    where: { handle },
    include: {
      skills: { include: { skill: true } },
      reviewsReceived: { include: { author: true }, orderBy: { createdAt: 'desc' }, take: 12 },
      contractsWork: { where: { status: 'COMPLETED' }, select: { id: true, title: true } },
      jobs: { where: { status: 'OPEN' }, orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });
}

export async function getDashboardData(userId: string) {
  const [openJobs, proposals, contracts, unread, earnings] = await Promise.all([
    db.job.count({ where: { clientId: userId, status: 'OPEN' } }),
    db.proposal.count({ where: { freelancerId: userId, status: { in: ['SUBMITTED', 'SHORTLISTED'] } } }),
    db.contract.count({
      where: {
        status: 'ACTIVE',
        OR: [{ clientId: userId }, { freelancerId: userId }],
      },
    }),
    db.notification.count({ where: { userId, readAt: null } }),
    db.ledgerEntry.aggregate({
      where: { userId, kind: 'RELEASE' },
      _sum: { amount: true },
    }),
  ]);

  return {
    openJobs,
    proposals,
    contracts,
    unread,
    earned: earnings._sum.amount ?? 0,
  };
}

export async function listMyContracts(userId: string) {
  return db.contract.findMany({
    where: { OR: [{ clientId: userId }, { freelancerId: userId }] },
    orderBy: { startedAt: 'desc' },
    include: {
      client: true,
      freelancer: true,
      milestones: true,
      _count: { select: { messages: true } },
    },
  });
}
