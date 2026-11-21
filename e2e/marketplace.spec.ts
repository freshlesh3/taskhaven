import { expect, test, type Page } from '@playwright/test';

const CLIENT = { email: 'lucas@taskhaven.dev', password: 'password123' };
const FREELANCER = { email: 'devon@taskhaven.dev', password: 'password123' };

async function login(page: Page, who: { email: string; password: string }) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(who.email);
  await page.getByLabel('Password').fill(who.password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe('marketplace money path', () => {
  test('a client hires, releases escrow and the freelancer sees the outcome', async ({ page, context }) => {
    await login(page, CLIENT);

    // The client opens one of their open jobs and hires the waiting proposal.
    await page.goto('/jobs');
    await page.getByRole('link', { name: /Stripe-backed subscription flow/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Stripe-backed subscription');

    await page.getByRole('button', { name: 'Hire and start contract' }).click();
    await expect(page).toHaveURL(/\/contracts\/.+/);
    const contractUrl = page.url();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Stripe-backed subscription');

    // The contract starts with one funded milestone.
    await expect(page.getByText('Full delivery')).toBeVisible();
    await expect(page.getByText('Funded', { exact: true })).toBeVisible();

    // Releasing it records the release and the platform fee, and completes the contract.
    await page.getByRole('button', { name: /^Release \$/ }).click();
    await expect(page.getByText('Released', { exact: true })).toBeVisible();
    await expect(page.getByText('Completed', { exact: true })).toBeVisible();
    await expect(page.getByText('RELEASE', { exact: true })).toBeVisible();
    await expect(page.getByText('FEE', { exact: true })).toBeVisible();

    // The freelancer is notified and can open the contract.
    await context.clearCookies();
    await login(page, FREELANCER);
    await page.goto('/notifications');
    await expect(page.getByText(/hired you/).first()).toBeVisible();

    await page.getByRole('link', { name: 'Open', exact: true }).first().click();
    await expect(page).toHaveURL(/\/contracts\/.+/);
    await expect(page.getByText('You are working with')).toBeVisible();

    // A third party must not be able to read the contract.
    await context.clearCookies();
    await login(page, { email: 'priya@taskhaven.dev', password: 'password123' });
    const response = await page.goto(contractUrl);
    expect(response?.status()).toBe(404);
  });

  test('a new account must confirm its email before posting work', async ({ page }) => {
    const email = `e2e-${Date.now()}@taskhaven.test`;

    await page.goto('/signup');
    await page.getByLabel('Full name').fill('E2E Tester');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('a-long-enough-password');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page).toHaveURL(/\/verify-notice/);
    await expect(page.getByRole('heading', { name: 'One more step' })).toBeVisible();

    await page.goto('/jobs/new');
    await expect(page).toHaveURL(/\/verify-notice\?error=unverified/);
    await expect(page.getByText('Confirm your email before posting a job')).toBeVisible();
  });
});
