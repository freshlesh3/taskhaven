import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const contract = await db.contract.findFirst({ orderBy: { startedAt: 'desc' } });
console.log(contract?.id ?? '');
await db.$disconnect();
