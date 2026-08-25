import { defineConfig, devices } from "@playwright/test";

const useLocalStarter = process.env.USE_LOCAL_STARTER_SOURCE === "true";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3000", trace: "on-first-retry" },
  webServer: [
    {
      command:
        "SPRING_DATASOURCE_URL='jdbc:h2:mem:startertemplatee2e;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1' " +
        "SPRING_DATASOURCE_USERNAME=sa SPRING_DATASOURCE_PASSWORD='' ../gradlew -p .. bootRun -x frontendBuild",
      url: "http://127.0.0.1:8080/api/auth/me",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: useLocalStarter ? "npm run dev:local-starter" : "npm run dev",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: !process.env.CI,
    },
  ],
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
  ],
});
