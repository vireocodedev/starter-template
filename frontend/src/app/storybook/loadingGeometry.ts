type LayoutShiftEntry = PerformanceEntry & {
  hadRecentInput: boolean;
  value: number;
};

function nextAnimationFrame() {
  return new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
}

/** Measures layout shifts caused by a programmatic state transition, excluding real user input. */
export async function measureUnexpectedLayoutShift(transition: () => Promise<void> | void) {
  if (!PerformanceObserver.supportedEntryTypes.includes("layout-shift")) {
    throw new Error("This browser does not expose the Layout Instability API.");
  }

  // Flush layout work from the story's scenario setup so the observer owns only
  // the transition supplied by the caller.
  await nextAnimationFrame();
  await nextAnimationFrame();

  let score = 0;
  const observer = new PerformanceObserver(list => {
    for (const entry of list.getEntries() as LayoutShiftEntry[]) {
      if (!entry.hadRecentInput) score += entry.value;
    }
  });

  observer.observe({ type: "layout-shift" });
  try {
    await transition();
    await nextAnimationFrame();
    await nextAnimationFrame();
    return score;
  } finally {
    observer.disconnect();
  }
}
