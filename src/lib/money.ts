/** Money helpers. All amounts are integer minor units (cents). */

export const PLATFORM_FEE_BPS = 1000; // 10%

export function formatMoney(cents: number | null | undefined, currency = 'USD'): string {
  if (cents === null || cents === undefined) return '—';
  const value = cents / 100;
  const hasCents = Math.round(cents) % 100 !== 0;
  const digits = hasCents ? 2 : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** "1,250" / "$1,250.50" / "1250.5" -> 125050 */
export function parseMoneyToCents(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) return null;
  const raw = String(input).trim();
  if (raw.startsWith('-')) return null;
  const cleaned = raw.replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round((value + Number.EPSILON) * 100);
}

export function platformFee(amount: number): number {
  return Math.round((amount * PLATFORM_FEE_BPS) / 10_000);
}

export function freelancerNet(amount: number): number {
  return amount - platformFee(amount);
}

export function formatRate(cents: number | null | undefined): string {
  if (!cents) return 'Rate not set';
  return `${formatMoney(cents)}/hr`;
}

export function formatBudget(
  min: number | null,
  max: number | null,
  type: string,
): string {
  const suffix = type === 'HOURLY' ? '/hr' : '';
  if (min && max && min !== max) return `${formatMoney(min)} – ${formatMoney(max)}${suffix}`;
  if (min) return `From ${formatMoney(min)}${suffix}`;
  if (max) return `Up to ${formatMoney(max)}${suffix}`;
  return 'Budget not set';
}
