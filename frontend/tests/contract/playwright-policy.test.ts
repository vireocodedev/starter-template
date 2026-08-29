import { parallelPlaywrightPolicy, serialPlaywrightPolicy } from "../../playwright.policy";

describe("Playwright execution policy", () => {
  it("fails focused tests and bounds retries, workers, assertions, and test duration", () => {
    expect(parallelPlaywrightPolicy).toEqual({
      expect: { timeout: 5_000 },
      forbidOnly: true,
      fullyParallel: true,
      retries: process.env.CI ? 1 : 0,
      timeout: 30_000,
      workers: process.env.CI ? 2 : undefined,
    });
    expect(serialPlaywrightPolicy).toEqual({
      ...parallelPlaywrightPolicy,
      fullyParallel: false,
      workers: 1,
    });
  });
});
