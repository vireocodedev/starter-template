import { defineConfig, devices } from "@playwright/test";

import { serialPlaywrightPolicy } from "./playwright.policy";

export default defineConfig({
  ...serialPlaywrightPolicy,
  testDir: "./tests/pwa",
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:4173",
    serviceWorkers: "allow",
    trace: "on-first-retry",
  },
  webServer: {
    command: "corepack npm run preview -- --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    stdout: process.env.CI ? "pipe" : "ignore",
  },
  projects: [{ name: "installed-pwa-chromium" }],
});
