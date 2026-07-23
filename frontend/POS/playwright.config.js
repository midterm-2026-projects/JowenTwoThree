import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.js",

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  timeout: 30000,

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
      },
    },
  ],

  webServer: [
    {
      command: "node src/server.js",
      cwd: "../../backend",
      port: 5000,
      reuseExistingServer: true,
      timeout: 10000,
    },
    {
      command: "npm run dev",
      cwd: ".",
      port: 3000,
      reuseExistingServer: true,
      timeout: 15000,
    },
  ],
});