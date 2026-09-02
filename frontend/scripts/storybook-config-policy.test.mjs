import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { resolve } from "node:path";

const configPath = resolve(import.meta.dirname, "..", "vitest.storybook.config.ts");

test("Storybook prebundles its public testing boundary for minimal story surfaces", () => {
  const config = readFileSync(configPath, "utf8");

  assert.match(
    config,
    /optimizeDeps:\s*\{\s*include:\s*\["@testing-library\/dom"\],\s*\}/u,
  );
  assert.match(config, /mergeConfig\(\s*viteConfig,/u);
  assert.equal((config.match(/storybookTest\(/gu) ?? []).length, 2);
  assert.match(config, /name:\s*"storybook"/u);
  assert.match(config, /name:\s*"storybook-reduced-motion"/u);
});
