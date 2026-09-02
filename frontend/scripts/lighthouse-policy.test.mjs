import assert from "node:assert/strict";
import test from "node:test";

import { aggregateLighthouseSamples, evaluateLighthouseSamples, lighthouseBudgets } from "./lighthouse-policy.mjs";

const atBudget = {
  performance: 0.75,
  accessibility: 1,
  bestPractices: 0.9,
  firstContentfulPaintMs: 4_000,
  largestContentfulPaintMs: 5_000,
  totalBlockingTimeMs: 500,
  cumulativeLayoutShift: 0.1,
};

test("Lighthouse policy accepts metrics exactly at every budget", () => {
  const result = evaluateLighthouseSamples([atBudget, atBudget, atBudget]);

  assert.deepEqual(result.aggregate, atBudget);
  assert.deepEqual(result.failures, []);
});

test("Lighthouse policy tolerates one composite-score outlier when the median passes", () => {
  const result = evaluateLighthouseSamples([
    { ...atBudget, performance: 0.5 },
    { ...atBudget, performance: 0.8 },
    { ...atBudget, performance: 0.8 },
  ]);

  assert.equal(result.aggregate.performance, 0.8);
  assert.deepEqual(result.failures, []);
});

test("Lighthouse policy fails when two regressed composite samples lower the median", () => {
  const result = evaluateLighthouseSamples([
    { ...atBudget, performance: 0.7 },
    { ...atBudget, performance: 0.7 },
    { ...atBudget, performance: 0.9 },
  ]);

  assert.equal(result.aggregate.performance, 0.7);
  assert.match(result.failures.join("\n"), /performance aggregate was 0.7/);
});

test("Lighthouse policy rejects an accessibility regression in any sample", () => {
  const result = evaluateLighthouseSamples([{ ...atBudget, accessibility: 0.99 }, atBudget, atBudget]);

  assert.match(result.failures.join("\n"), /accessibility sample 1 was 0.99/);
});

test("Lighthouse policy rejects a best-practices regression in any sample", () => {
  const result = evaluateLighthouseSamples([{ ...atBudget, bestPractices: 0.89 }, atBudget, atBudget]);

  assert.match(result.failures.join("\n"), /bestPractices sample 1 was 0.89/);
});

test("Lighthouse policy rejects a timing hard-cap violation in any sample", () => {
  const result = evaluateLighthouseSamples([{ ...atBudget, largestContentfulPaintMs: 5_001 }, atBudget, atBudget]);

  assert.match(result.failures.join("\n"), /largestContentfulPaintMs sample 1 was 5001; hard maximum is 5000/);
});

test("Lighthouse policy records the configured aggregation modes", () => {
  const aggregate = aggregateLighthouseSamples([
    { ...atBudget, performance: 0.75, accessibility: 1, bestPractices: 0.9 },
    { ...atBudget, performance: 0.8, accessibility: 0.95, bestPractices: 0.95 },
    { ...atBudget, performance: 0.9, accessibility: 1, bestPractices: 1 },
  ]);

  assert.equal(lighthouseBudgets.performance.aggregate, "median");
  assert.equal(aggregate.performance, 0.8);
  assert.equal(aggregate.accessibility, 0.95);
  assert.equal(aggregate.bestPractices, 0.9);
});
