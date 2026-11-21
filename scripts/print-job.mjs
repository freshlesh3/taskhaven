import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const job = await db.job.findFirst({ where: { status: 'OPEN', isHidden: false } });
console.log(job?.id ?? '');
await db.$disconnect();
