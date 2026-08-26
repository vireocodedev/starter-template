import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import path from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          plugins: [storybookTest({ configDir: path.join(import.meta.dirname, ".storybook") })],
          test: {
            name: "storybook",
            browser: {
              enabled: true,
              headless: true,
              provider: playwright({}),
              instances: [
                { browser: "chromium", name: "desktop", viewport: { height: 900, width: 1440 } },
                { browser: "chromium", name: "mobile", viewport: { height: 844, width: 390 } },
              ],
            },
          },
        },
        {
          extends: true,
          plugins: [storybookTest({ configDir: path.join(import.meta.dirname, ".storybook") })],
          test: {
            name: "storybook-reduced-motion",
            browser: {
              enabled: true,
              headless: true,
              provider: playwright({ contextOptions: { reducedMotion: "reduce" } }),
              instances: [{ browser: "chromium", name: "desktop-reduced", viewport: { height: 900, width: 1440 } }],
            },
          },
        },
      ],
    },
  }),
);
