export const LIGHTHOUSE_SAMPLE_COUNT = 3;

/**
 * These are production-bundle regression budgets, not field-performance SLOs.
 * Category scores use the configured aggregate while timing metrics also retain
 * their existing per-sample hard caps so one pathological run cannot be hidden
 * by the median.
 */
export const lighthouseBudgets = Object.freeze({
  performance: { aggregate: "median", minimum: 0.75 },
  accessibility: { aggregate: "minimum", minimum: 1 },
  bestPractices: { aggregate: "minimum", minimum: 0.9 },
  firstContentfulPaintMs: { aggregate: "median", maximum: 4_000, rawMaximum: 4_000 },
  largestContentfulPaintMs: { aggregate: "median", maximum: 5_000, rawMaximum: 5_000 },
  totalBlockingTimeMs: { aggregate: "median", maximum: 500, rawMaximum: 500 },
  cumulativeLayoutShift: { aggregate: "median", maximum: 0.1, rawMaximum: 0.1 },
});

export function aggregateLighthouseSamples(samples) {
  requireSamples(samples);

  return Object.fromEntries(
    Object.entries(lighthouseBudgets).map(([metric, budget]) => {
      const values = samples.map(sample => sample[metric]);
      return [metric, budget.aggregate === "minimum" ? Math.min(...values) : median(values)];
    }),
  );
}

export function evaluateLighthouseSamples(samples) {
  requireSamples(samples);
  const aggregate = aggregateLighthouseSamples(samples);
  const failures = [];

  for (const [metric, budget] of Object.entries(lighthouseBudgets)) {
    const aggregateValue = aggregate[metric];
    if ("minimum" in budget && aggregateValue < budget.minimum) {
      failures.push(`${metric} aggregate was ${aggregateValue}; minimum is ${budget.minimum}`);
    }
    if ("maximum" in budget && aggregateValue > budget.maximum) {
      failures.push(`${metric} aggregate was ${aggregateValue}; maximum is ${budget.maximum}`);
    }

    for (const [sampleIndex, sample] of samples.entries()) {
      const sampleValue = sample[metric];
      if (
        (metric === "accessibility" || metric === "bestPractices") &&
        "minimum" in budget &&
        sampleValue < budget.minimum
      ) {
        failures.push(`${metric} sample ${sampleIndex + 1} was ${sampleValue}; minimum is ${budget.minimum}`);
      }
      if ("rawMaximum" in budget && sampleValue > budget.rawMaximum) {
        failures.push(`${metric} sample ${sampleIndex + 1} was ${sampleValue}; hard maximum is ${budget.rawMaximum}`);
      }
    }
  }

  return { aggregate, failures };
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

function requireSamples(samples) {
  if (!Array.isArray(samples) || samples.length !== LIGHTHOUSE_SAMPLE_COUNT) {
    throw new Error(`Lighthouse policy requires exactly ${LIGHTHOUSE_SAMPLE_COUNT} samples.`);
  }
  for (const [sampleIndex, sample] of samples.entries()) {
    for (const metric of Object.keys(lighthouseBudgets)) {
      if (!Number.isFinite(sample?.[metric])) {
        throw new Error(`Lighthouse sample ${sampleIndex + 1} has no finite ${metric} value.`);
      }
    }
  }
}
