import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '*.spec.js',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: 'list',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    }
  ],
  webServer: [
    {
      command: 'node src/server.js',
      port: 5000,
      cwd: '../../backend',
      reuseExistingServer: true,
      timeout: 10000
    },
    {
      command: 'npx vite --port 3000',
      port: 3000,
      reuseExistingServer: true,
      timeout: 15000
    }
  ]
})
