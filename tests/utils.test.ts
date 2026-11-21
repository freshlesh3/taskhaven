import { describe, expect, it } from 'vitest';
import { initials, slugify, timeAgo, truncate } from '@/lib/utils';

describe('initials', () => {
  it('uses the first letters of the first two words', () => {
    expect(initials('Mara Lindqvist')).toBe('ML');
  });

  it('handles a single name', () => {
    expect(initials('Priya')).toBe('P');
  });

  it('ignores extra whitespace', () => {
    expect(initials('  Devon   Adeyemi ')).toBe('DA');
  });
});

describe('slugify', () => {
  it('produces url-safe slugs', () => {
    expect(slugify('Design Systems & Tokens')).toBe('design-systems-tokens');
  });

  it('collapses repeated separators', () => {
    expect(slugify('Next.js --- App Router')).toBe('nextjs-app-router');
  });

  it('returns an empty string when nothing survives', () => {
    expect(slugify('***')).toBe('');
  });
});

describe('truncate', () => {
  it('leaves short text alone', () => {
    expect(truncate('short', 20)).toBe('short');
  });

  it('adds an ellipsis when cutting', () => {
    const result = truncate('a'.repeat(50), 10);
    expect(result).toHaveLength(10);
    expect(result.endsWith('…')).toBe(true);
  });
});

describe('timeAgo', () => {
  it('describes recent timestamps', () => {
    expect(timeAgo(new Date(Date.now() - 5_000))).toBe('5 seconds ago');
  });

  it('uses the singular for one unit', () => {
    expect(timeAgo(new Date(Date.now() - 60_000))).toBe('1 minute ago');
  });

  it('describes days', () => {
    expect(timeAgo(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))).toBe('3 days ago');
  });

  it('accepts an iso string', () => {
    expect(timeAgo(new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())).toBe('2 hours ago');
  });
});
