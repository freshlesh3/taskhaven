import { describe, expect, it } from 'vitest';
import {
  PLATFORM_FEE_BPS,
  formatBudget,
  formatMoney,
  formatRate,
  freelancerNet,
  parseMoneyToCents,
  platformFee,
} from '@/lib/money';

describe('formatMoney', () => {
  it('formats whole dollars without cents', () => {
    expect(formatMoney(120000)).toBe('$1,200');
  });

  it('formats fractional dollars with cents', () => {
    expect(formatMoney(120050)).toBe('$1,200.50');
  });

  it('returns a dash for missing amounts', () => {
    expect(formatMoney(null)).toBe('—');
    expect(formatMoney(undefined)).toBe('—');
  });

  it('handles zero', () => {
    expect(formatMoney(0)).toBe('$0');
  });
});

describe('parseMoneyToCents', () => {
  it('parses plain numbers', () => {
    expect(parseMoneyToCents('1250')).toBe(125000);
  });

  it('strips currency symbols and separators', () => {
    expect(parseMoneyToCents('$1,250.50')).toBe(125050);
  });

  it('rejects empty and negative input', () => {
    expect(parseMoneyToCents('')).toBeNull();
    expect(parseMoneyToCents('-20')).toBeNull();
    expect(parseMoneyToCents(null)).toBeNull();
  });

  it('rounds to the nearest cent', () => {
    expect(parseMoneyToCents('0.005')).toBe(1);
  });
});

describe('fees', () => {
  it('keeps the configured fee rate', () => {
    expect(PLATFORM_FEE_BPS).toBe(1000);
  });

  it('takes ten percent and leaves the rest', () => {
    expect(platformFee(100000)).toBe(10000);
    expect(freelancerNet(100000)).toBe(90000);
  });

  it('rounds the fee to a whole cent', () => {
    expect(platformFee(12345)).toBe(1235);
    expect(freelancerNet(12345)).toBe(11110);
  });

  it('never returns a negative net', () => {
    expect(freelancerNet(0)).toBe(0);
  });
});

describe('formatBudget', () => {
  it('renders a range', () => {
    expect(formatBudget(100000, 200000, 'FIXED')).toBe('$1,000 – $2,000');
  });

  it('adds the hourly suffix', () => {
    expect(formatBudget(8000, 12000, 'HOURLY')).toBe('$80 – $120/hr');
  });

  it('collapses a single value', () => {
    expect(formatBudget(50000, 50000, 'FIXED')).toBe('From $500');
  });

  it('falls back when no budget is set', () => {
    expect(formatBudget(null, null, 'FIXED')).toBe('Budget not set');
  });
});

describe('formatRate', () => {
  it('formats an hourly rate', () => {
    expect(formatRate(8500)).toBe('$85/hr');
  });

  it('explains a missing rate', () => {
    expect(formatRate(null)).toBe('Rate not set');
  });
});
