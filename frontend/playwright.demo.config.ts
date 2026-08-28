import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.VIREO_DEMO_BASE_URL;
if (!baseURL?.startsWith("https://")) {
  throw new Error("VIREO_DEMO_BASE_URL must be the public HTTPS flagship-demo origin.");
}

export default defineConfig({
  testDir: "./tests/demo",
  fullyParallel: false,
  forbidOnly: true,
  retries: 1,
  reporter: "list",
  timeout: 30_000,
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "flagship-demo-chromium" }],
});
