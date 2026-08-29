import assert from "node:assert/strict";
import test from "node:test";

import { mayAppImportFeature, mayImportGeneratedRegistry } from "./architecture-policy.mjs";

test("only explicit application composition adapters may depend on business features", () => {
  assert.equal(mayAppImportFeature("app/adapters/app.adapters.ts"), true);
  assert.equal(mayAppImportFeature("app/adapters/mock/app.mock-adapters.ts"), true);
  assert.equal(mayAppImportFeature("app/app.localization.ts"), true);
  assert.equal(mayAppImportFeature("app/shell/providers/AppProvider.tsx"), false);
  assert.equal(mayAppImportFeature("app/data/query/query-client.ts"), false);
});

test("generated capability imports stay within the registry composition boundary", () => {
  assert.equal(mayImportGeneratedRegistry("generated/orders/order.capability.ts"), true);
  assert.equal(mayImportGeneratedRegistry("app/app.pages.ts"), true);
  assert.equal(mayImportGeneratedRegistry("app/app.localization.ts"), true);
  assert.equal(mayImportGeneratedRegistry("pages/home/AppPageHome.tsx"), false);
  assert.equal(mayImportGeneratedRegistry("features/item/public.ts"), false);
});
