import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

const SKILLS = [
  ['React', 'react'],
  ['TypeScript', 'typescript'],
  ['Next.js', 'nextjs'],
  ['Node.js', 'nodejs'],
  ['PostgreSQL', 'postgresql'],
  ['Prisma', 'prisma'],
  ['Product design', 'product-design'],
  ['Design systems', 'design-systems'],
  ['Figma', 'figma'],
  ['Tailwind CSS', 'tailwind-css'],
  ['Python', 'python'],
  ['Machine learning', 'machine-learning'],
  ['Data visualisation', 'data-visualisation'],
  ['Copywriting', 'copywriting'],
  ['SEO', 'seo'],
  ['Stripe', 'stripe'],
  ['Accessibility', 'accessibility'],
  ['Brand identity', 'brand-identity'],
  ['Motion design', 'motion-design'],
  ['Bookkeeping', 'bookkeeping'],
] as const;

const USERS = [
  {
    email: 'mara@taskhaven.dev',
    name: 'Mara Lindqvist',
    handle: 'mara',
    role: 'FREELANCER',
    headline: 'Product designer for SaaS dashboards',
    country: 'Portugal',
    hourlyRate: 8500,
    avatarHue: 150,
    bio: 'I design calm, information-dense interfaces for B2B products. Ten years in, most of my work is turning a messy internal tool into something a team actually enjoys opening every day.\n\nRecent projects: a billing console for a fintech, a scheduling product for clinics, and a design system that survived three rebrands.',
    skills: ['Product design', 'Design systems', 'Figma', 'Accessibility'],
  },
  {
    email: 'devon@taskhaven.dev',
    name: 'Devon Adeyemi',
    handle: 'devon',
    role: 'FREELANCER',
    headline: 'Full-stack engineer · Next.js, Postgres, Stripe',
    country: 'Nigeria',
    hourlyRate: 9500,
    avatarHue: 200,
    bio: 'I build and rescue web applications. Comfortable owning a feature from schema to shipped UI, and equally happy untangling a codebase someone else abandoned.',
    skills: ['React', 'TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'Stripe'],
  },
  {
    email: 'priya@taskhaven.dev',
    name: 'Priya Shah',
    handle: 'priya',
    role: 'FREELANCER',
    headline: 'Data scientist · forecasting and analytics',
    country: 'India',
    hourlyRate: 7800,
    avatarHue: 280,
    bio: 'Forecasting, experimentation and the unglamorous data plumbing that makes both possible. I like problems where the answer has to survive a finance review.',
    skills: ['Python', 'Machine learning', 'Data visualisation', 'PostgreSQL'],
  },
  {
    email: 'lucas@taskhaven.dev',
    name: 'Lucas Moreau',
    handle: 'northwind',
    role: 'CLIENT',
    headline: 'Founder at Northwind Studio',
    country: 'France',
    avatarHue: 30,
    bio: 'Small studio building tools for independent retailers.',
    skills: ['Product design'],
  },
  {
    email: 'aisha@taskhaven.dev',
    name: 'Aisha Bakker',
    handle: 'fermway',
    role: 'CLIENT',
    headline: 'Operations lead at Fermway',
    country: 'Netherlands',
    avatarHue: 340,
    bio: 'We run logistics software for mid-size farms. Always hiring for short, well-scoped pieces of work.',
    skills: ['SEO'],
  },
] as const;

const JOBS = [
  {
    title: 'Redesign the billing console for a fintech dashboard',
    category: 'design-creative',
    client: 'northwind',
    budgetType: 'FIXED',
    budgetMin: 320000,
    budgetMax: 480000,
    experience: 'EXPERT',
    duration: '3–4 weeks',
    skills: ['Product design', 'Design systems', 'Figma'],
    description:
      'We have a billing console that works but fights the user at every step: invoices, dunning, plan changes and a usage graph nobody trusts.\n\nWe want a redesign of the core screens (invoice list, invoice detail, plan change, payment methods) with a reusable set of components that our engineers can build against. Figma, light and dark, desktop first.\n\nDeliverables: audit of the current flow, wireframes, high-fidelity screens, a component sheet with states, and a short handoff doc.',
  },
  {
    title: 'Build a Stripe-backed subscription flow in Next.js',
    category: 'dev-it',
    client: 'northwind',
    budgetType: 'HOURLY',
    budgetMin: 9000,
    budgetMax: 12000,
    experience: 'EXPERT',
    duration: '2–4 weeks',
    skills: ['Next.js', 'TypeScript', 'Stripe', 'PostgreSQL'],
    description:
      'We need a production-grade subscription flow: plans, trials, proration, failed-payment handling and a customer portal.\n\nOur stack is Next.js App Router, Prisma and Postgres. You will own the integration end to end, including webhooks and the reconciliation job that keeps our entitlement table honest.\n\nWe care more about correctness under retries than about speed of delivery.',
  },
  {
    title: 'Turn our spreadsheet forecasts into a proper dashboard',
    category: 'data-analytics',
    client: 'fermway',
    budgetType: 'FIXED',
    budgetMin: 180000,
    budgetMax: 260000,
    experience: 'INTERMEDIATE',
    duration: '2 weeks',
    skills: ['Python', 'Data visualisation', 'PostgreSQL'],
    description:
      'Operations keeps a 14-tab spreadsheet that predicts demand per region. It is fragile and only one person understands it.\n\nWe want the same logic moved into a small service plus a dashboard: ingest the CSVs, compute the forecasts, show actuals versus forecast per region, and flag when a region drifts.\n\nDeliver the code, a short model note, and a runbook for updating it.',
  },
  {
    title: 'Accessibility audit of a checkout flow',
    category: 'design-creative',
    client: 'fermway',
    budgetType: 'FIXED',
    budgetMin: 80000,
    budgetMax: 120000,
    experience: 'INTERMEDIATE',
    duration: '1 week',
    skills: ['Accessibility', 'React'],
    description:
      'Our checkout is keyboard-hostile and the error states are invisible to screen readers. We want a focused audit of the four checkout steps, with reproducible issues, severity, and suggested fixes that our team can apply.',
  },
  {
    title: 'Write the launch copy for a developer tool',
    category: 'writing',
    client: 'northwind',
    budgetType: 'FIXED',
    budgetMin: 60000,
    budgetMax: 90000,
    experience: 'INTERMEDIATE',
    duration: '1–2 weeks',
    skills: ['Copywriting', 'SEO'],
    description:
      'We are launching a CLI that turns spreadsheets into typed APIs. We need a landing page narrative, five feature blurbs, and a docs introduction that does not sound like every other developer tool.\n\nTone: direct, concrete, a little dry. No exclamation marks.',
  },
  {
    title: 'Rescue a stalled migration from CRA to Next.js',
    category: 'dev-it',
    client: 'fermway',
    budgetType: 'HOURLY',
    budgetMin: 8000,
    budgetMax: 11000,
    experience: 'EXPERT',
    duration: '3–6 weeks',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    description:
      'A previous contractor moved about 40% of our app from Create React App to the Next.js App Router. Routing works; data fetching, auth and the design system do not.\n\nWe need someone to finish the migration, delete the dead paths, and leave a short note on what changed. The codebase has tests for the parts that matter.',
  },
  {
    title: 'Set up bookkeeping for a two-person studio',
    category: 'finance-legal',
    client: 'northwind',
    budgetType: 'FIXED',
    budgetMin: 90000,
    budgetMax: 140000,
    experience: 'INTERMEDIATE',
    duration: '1 week',
    skills: ['Bookkeeping'],
    description:
      'We need a clean chart of accounts, a monthly close checklist, and a simple process for invoicing and expenses across two currencies. Prefer tools that export to something portable.',
  },
  {
    title: 'Design a small brand system for a farm-logistics product',
    category: 'design-creative',
    client: 'fermway',
    budgetType: 'FIXED',
    budgetMin: 150000,
    budgetMax: 220000,
    experience: 'INTERMEDIATE',
    duration: '2–3 weeks',
    skills: ['Brand identity', 'Figma', 'Motion design'],
    description:
      'We are not a lifestyle brand; we are software that dispatchers use at 5am. We want a restrained identity: type scale, colour, iconography rules, and a logo that works at 16px in a browser tab.',
  },
] as const;

const PROPOSALS = [
  {
    job: 'Redesign the billing console for a fintech dashboard',
    freelancer: 'mara',
    bidAmount: 420000,
    deliveryDays: 24,
    status: 'ACCEPTED',
    coverLetter:
      'I have redesigned two billing consoles in the last three years, including one where dunning was the main source of support tickets.\n\nMy approach: a week of audit and interviews with whoever answers the support queue, then wireframes for the four flows, then high-fidelity screens with a component sheet covering empty, loading, error and permission states.\n\nI would push back on a dark mode in v1 unless your dashboard already supports one — it doubles the state surface for little gain at this stage.',
  },
  {
    job: 'Redesign the billing console for a fintech dashboard',
    freelancer: 'devon',
    bidAmount: 380000,
    deliveryDays: 28,
    status: 'SHORTLISTED',
    coverLetter:
      'Design-led engineering here: I can deliver the Figma work and the React implementation of the component sheet, which removes the handoff gap that usually eats a week.\n\nI have shipped two design systems in Next.js with Tailwind and Radix primitives. Happy to start with the invoice detail screen as a vertical slice you can react to before I build the rest.',
  },
  {
    job: 'Build a Stripe-backed subscription flow in Next.js',
    freelancer: 'devon',
    bidAmount: 10500,
    deliveryDays: 21,
    status: 'SUBMITTED',
    coverLetter:
      'Subscriptions are mostly an idempotency problem once money is involved. I would start by mapping your entitlement model, then build the webhook handler with a durable event log so retries and out-of-order deliveries cannot corrupt state.\n\nI have done this on three SaaS products; happy to walk through the schema I would propose before writing code.',
  },
  {
    job: 'Turn our spreadsheet forecasts into a proper dashboard',
    freelancer: 'priya',
    bidAmount: 240000,
    deliveryDays: 14,
    status: 'SHORTLISTED',
    coverLetter:
      'First I would reproduce your spreadsheet logic exactly, including its quirks, then show where it and a simple baseline disagree. That comparison usually reveals whether the spreadsheet is adding signal or just confidence.\n\nPython, Postgres, and a small dashboard that a non-technical operator can refresh without me.',
  },
  {
    job: 'Write the launch copy for a developer tool',
    freelancer: 'mara',
    bidAmount: 75000,
    deliveryDays: 9,
    status: 'SUBMITTED',
    coverLetter:
      'I write the way your tool behaves: short sentences, concrete verbs, no adjectives doing the work of evidence. I would want to read the CLI docs and run one example end to end before drafting.',
  },
  {
    job: 'Accessibility audit of a checkout flow',
    freelancer: 'priya',
    bidAmount: 95000,
    deliveryDays: 6,
    status: 'SUBMITTED',
    coverLetter:
      'I audit with a keyboard first, then VoiceOver and NVDA, then automated checks as a backstop. Every finding gets a reproduction path and a fix that fits your component library rather than a generic recommendation.',
  },
] as const;

async function main() {
  console.log('Seeding Taskhaven…');

  await db.review.deleteMany();
  await db.ledgerEntry.deleteMany();
  await db.message.deleteMany();
  await db.milestone.deleteMany();
  await db.contract.deleteMany();
  await db.proposal.deleteMany();
  await db.jobSkill.deleteMany();
  await db.job.deleteMany();
  await db.userSkill.deleteMany();
  await db.skill.deleteMany();
  await db.session.deleteMany();
  await db.notification.deleteMany();
  await db.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  const skillIds = new Map<string, string>();
  for (const [name, slug] of SKILLS) {
    const skill = await db.skill.create({ data: { name, slug } });
    skillIds.set(name, skill.id);
  }

  const userIds = new Map<string, string>();
  for (const user of USERS) {
    const created = await db.user.create({
      data: {
        email: user.email,
        name: user.name,
        handle: user.handle,
        role: user.role,
        headline: user.headline,
        bio: 'bio' in user ? user.bio : null,
        country: user.country,
        hourlyRate: 'hourlyRate' in user ? user.hourlyRate : null,
        avatarHue: user.avatarHue,
        passwordHash,
        isAvailable: true,
        skills: {
          create: user.skills
            .map((name) => skillIds.get(name))
            .filter((id): id is string => Boolean(id))
            .map((skillId) => ({ skillId })),
        },
      },
    });
    userIds.set(user.handle, created.id);
  }

  const jobIds = new Map<string, string>();
  let dayOffset = JOBS.length;
  for (const job of JOBS) {
    const clientId = userIds.get(job.client);
    if (!clientId) continue;
    const createdAt = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);
    dayOffset -= 1;

    const created = await db.job.create({
      data: {
        clientId,
        title: job.title,
        description: job.description,
        category: job.category,
        budgetType: job.budgetType,
        budgetMin: job.budgetMin,
        budgetMax: job.budgetMax,
        experience: job.experience,
        duration: job.duration,
        status: 'OPEN',
        createdAt,
        skills: {
          create: job.skills
            .map((name) => skillIds.get(name))
            .filter((id): id is string => Boolean(id))
            .map((skillId) => ({ skillId })),
        },
      },
    });
    jobIds.set(job.title, created.id);
  }

  let proposalCount = 0;
  for (const proposal of PROPOSALS) {
    const jobId = jobIds.get(proposal.job);
    const freelancerId = userIds.get(proposal.freelancer);
    if (!jobId || !freelancerId) continue;

    await db.proposal.create({
      data: {
        jobId,
        freelancerId,
        coverLetter: proposal.coverLetter,
        bidAmount: proposal.bidAmount,
        deliveryDays: proposal.deliveryDays,
        status: proposal.status,
      },
    });
    proposalCount += 1;
  }

  for (const [title, id] of jobIds) {
    const count = PROPOSALS.filter((proposal) => proposal.job === title).length;
    if (count) await db.job.update({ where: { id }, data: { proposalCount: count } });
  }

  // One job is already hired and running, so the app has a real contract to show.
  const hiredJobId = jobIds.get('Redesign the billing console for a fintech dashboard');
  const clientId = userIds.get('northwind');
  const freelancerId = userIds.get('mara');

  if (hiredJobId && clientId && freelancerId) {
    await db.job.update({ where: { id: hiredJobId }, data: { status: 'CLOSED' } });

    const contract = await db.contract.create({
      data: {
        jobId: hiredJobId,
        clientId,
        freelancerId,
        title: 'Billing console redesign',
        totalAmount: 420000,
        status: 'ACTIVE',
        startedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        milestones: {
          create: [
            {
              title: 'Audit and flow map',
              description: 'Current-state audit, support-ticket review, and the proposed flow.',
              amount: 120000,
              status: 'RELEASED',
              releasedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            },
            {
              title: 'Wireframes for the four core screens',
              description: 'Invoice list, invoice detail, plan change, payment methods.',
              amount: 150000,
              status: 'SUBMITTED',
            },
            {
              title: 'High-fidelity screens and component sheet',
              description: 'Light mode, all states, plus handoff notes.',
              amount: 150000,
              status: 'FUNDED',
            },
          ],
        },
      },
    });

    const messages = [
      { senderId: clientId, body: 'Kicked off the audit today. Support says dunning is the top ticket source — I will start there.', days: 8 },
      { senderId: freelancerId, body: 'Good. Pull the last 90 days if you can, and note which refunds were manual fixes.', days: 8 },
      { senderId: clientId, body: 'Sent as a CSV. The audit doc is in the shared folder.', days: 6 },
      { senderId: freelancerId, body: 'Flow map is up. Wireframes for the invoice list are next; I will post them here before the component sheet.', days: 2 },
    ];

    for (const message of messages) {
      await db.message.create({
        data: {
          contractId: contract.id,
          senderId: message.senderId,
          body: message.body,
          createdAt: new Date(Date.now() - message.days * 24 * 60 * 60 * 1000),
        },
      });
    }

    await db.ledgerEntry.createMany({
      data: [
        {
          userId: clientId,
          contractId: contract.id,
          kind: 'FUND',
          amount: 420000,
          note: 'All milestones funded at contract start (simulated)',
        },
        {
          userId: freelancerId,
          contractId: contract.id,
          kind: 'RELEASE',
          amount: 108000,
          note: 'Milestone released: Audit and flow map (net of 10% fee)',
        },
        {
          userId: clientId,
          contractId: contract.id,
          kind: 'FEE',
          amount: 12000,
          note: 'Platform fee (10%, simulated)',
        },
      ],
    });

    await db.review.create({
      data: {
        contractId: contract.id,
        authorId: clientId,
        subjectId: freelancerId,
        rating: 5,
        comment: 'Fast, opinionated in the right places, and the audit paid for itself in the first week.',
      },
    });

    await db.notification.createMany({
      data: [
        {
          userId: freelancerId,
          kind: 'MILESTONE',
          body: 'A milestone was submitted for review on “Billing console redesign”',
          href: `/contracts/${contract.id}`,
        },
        {
          userId: clientId,
          kind: 'MESSAGE',
          body: 'Mara Lindqvist sent a message on “Billing console redesign”',
          href: `/contracts/${contract.id}`,
        },
      ],
    });
  }

  console.log(`Seeded ${USERS.length} users, ${JOBS.length} jobs, ${proposalCount} proposals.`);
  console.log('Demo password for every account: password123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
