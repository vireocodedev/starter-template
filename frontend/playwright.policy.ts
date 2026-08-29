export const parallelPlaywrightPolicy = {
  expect: { timeout: 5_000 },
  forbidOnly: true,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  timeout: 30_000,
  workers: process.env.CI ? 2 : undefined,
} as const;

export const serialPlaywrightPolicy = {
  ...parallelPlaywrightPolicy,
  fullyParallel: false,
  workers: 1,
} as const;
