import { defineConfig } from '@playwright/test';

const PORT = 3100;

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    video: 'off',
  },
  webServer: {
    // A fresh database per run keeps the escrow assertions deterministic.
    command: `npm run db:reset && npm run build && npx next start -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}/api/health`,
    reuseExistingServer: false,
    timeout: 300_000,
    env: {
      DATABASE_URL: 'file:./e2e.db',
      NEXT_PUBLIC_SITE_URL: `http://127.0.0.1:${PORT}`,
      ALLOW_SESSION_HELPER: '1',
    },
  },
});
