import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.js"],

    exclude: [
      "e2e/**",
      "tests/e2e/**",
      "playwright-report/**",
      "test-results/**",
      "node_modules/**"
    ],

    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"]
    }
  }
});