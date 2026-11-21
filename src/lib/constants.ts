export const CATEGORIES = [
  { slug: 'dev-it', label: 'Dev & IT', blurb: 'Engineering, web, mobile and infrastructure' },
  { slug: 'ai-automation', label: 'AI & Automation', blurb: 'Agents, data pipelines and model tooling' },
  { slug: 'design-creative', label: 'Design & Creative', blurb: 'Product, brand, illustration and motion' },
  { slug: 'marketing', label: 'Marketing', blurb: 'Growth, content, SEO and paid media' },
  { slug: 'data-analytics', label: 'Data & Analytics', blurb: 'Dashboards, warehousing and reporting' },
  { slug: 'admin-support', label: 'Admin & Support', blurb: 'Operations, assistance and coordination' },
  { slug: 'writing', label: 'Writing', blurb: 'Copy, documentation and editorial' },
  { slug: 'finance-legal', label: 'Finance & Legal', blurb: 'Bookkeeping, contracts and compliance' },
] as const;

export const EXPERIENCE_LABELS: Record<string, string> = {
  ENTRY: 'Entry level',
  INTERMEDIATE: 'Intermediate',
  EXPERT: 'Expert',
};

export const BUDGET_LABELS: Record<string, string> = {
  FIXED: 'Fixed price',
  HOURLY: 'Hourly',
};

export const PROPOSAL_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Submitted',
  SHORTLISTED: 'Shortlisted',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
  WITHDRAWN: 'Withdrawn',
};

export const CONTRACT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const MILESTONE_STATUS_LABELS: Record<string, string> = {
  FUNDED: 'Funded',
  IN_PROGRESS: 'In progress',
  SUBMITTED: 'Submitted for review',
  RELEASED: 'Released',
};

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((category) => category.slug === slug)?.label ?? slug;
}
