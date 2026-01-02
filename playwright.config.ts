import { defineConfig, devices } from '@playwright/test';

const freezeBots = process.env.DEMO_FREEZE_BOTS ?? (process.env.HUMAN_LIKE === '1' ? '0' : '1');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 5 * 60 * 1000,
  expect: { timeout: 30 * 1000 },
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'off',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: `DEMO_FREEZE_BOTS=${freezeBots} concurrently -n server,web -c blue,green "npm run dev:server" "npm -w ui/web run dev -- --host 127.0.0.1 --port 5173"`,
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 2 * 60 * 1000,
  },
});
