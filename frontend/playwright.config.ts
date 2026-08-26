import { defineConfig, devices } from "@playwright/test";

const useLocalStarter = process.env.USE_LOCAL_STARTER_SOURCE === "true";
const webServerStartupTimeout = 90_000;
const frontendDevCommand = useLocalStarter ? "npm run dev:local-starter" : "npm run dev";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3000", trace: "on-first-retry" },
  webServer: [
    {
      command:
        "SPRING_DATASOURCE_URL='jdbc:h2:mem:startertemplatee2e;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1' " +
        "SPRING_DATASOURCE_USERNAME=sa SPRING_DATASOURCE_PASSWORD='' ../gradlew -p .. bootRun --console=plain",
      url: "http://127.0.0.1:8080/actuator/health/readiness",
      reuseExistingServer: !process.env.CI,
      timeout: webServerStartupTimeout,
      stdout: process.env.CI ? "pipe" : "ignore",
    },
    {
      command: `${frontendDevCommand} -- --host 127.0.0.1 --strictPort`,
      url: "http://127.0.0.1:3000",
      reuseExistingServer: !process.env.CI,
      timeout: webServerStartupTimeout,
      stdout: process.env.CI ? "pipe" : "ignore",
    },
  ],
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
  ],
});
