import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.VIREO_DEPLOYMENT_BASE_URL;
if (!baseURL || !/^http:\/\/127\.0\.0\.1:\d+$/u.test(baseURL)) {
  throw new Error("VIREO_DEPLOYMENT_BASE_URL must be an explicit loopback HTTP origin.");
}
if (!process.env.VIREO_DEPLOYMENT_SMOKE_USERNAME || !process.env.VIREO_DEPLOYMENT_SMOKE_PASSWORD) {
  throw new Error("Deployment-smoke credentials are required.");
}

export default defineConfig({
  testDir: "./tests/deployment",
  fullyParallel: false,
  forbidOnly: true,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  timeout: 30_000,
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "production-stack-chromium" }],
});
