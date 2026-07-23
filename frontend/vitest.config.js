import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,

    setupFiles: [
      "./Inventory/src/setupTests.js"
    ],

    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",

      // Ignore Playwright tests
      "**/POS/e2e/**",

      // Ignore Playwright outputs
      "**/playwright-report/**",
      "**/test-results/**"
    ]
  }
});