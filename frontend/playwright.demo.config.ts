import { defineConfig, devices } from "@playwright/test";

import { serialPlaywrightPolicy } from "./playwright.policy";

const baseURL = process.env.VIREO_DEMO_BASE_URL;
if (!baseURL?.startsWith("https://")) {
  throw new Error("VIREO_DEMO_BASE_URL must be the public HTTPS flagship-demo origin.");
}

export default defineConfig({
  ...serialPlaywrightPolicy,
  testDir: "./tests/demo",
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "flagship-demo-chromium" }],
});
