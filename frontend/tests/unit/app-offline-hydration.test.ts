import { describe, expect, it, vi } from "vitest";
import { requestOfflineHydration, runOfflineRecovery } from "@/app/offline/services/app-offline-hydration";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>(resolvePromise => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

describe("offline hydration coordinator", () => {
  it("folds replay-period batches into the final recovery hydration", async () => {
    const hydrate = vi.fn().mockResolvedValue(undefined);

    await runOfflineRecovery(async () => {
      await requestOfflineHydration(hydrate);
      await requestOfflineHydration(hydrate);
    }, hydrate);

    expect(hydrate).toHaveBeenCalledOnce();
  });

  it("runs one trailing hydration for a batch received during the final fetch", async () => {
    const hydrate = vi.fn(async () => {
      if (hydrate.mock.calls.length === 1) await requestOfflineHydration(hydrate);
    });

    await runOfflineRecovery(async () => undefined, hydrate);

    expect(hydrate).toHaveBeenCalledTimes(2);
  });

  it("serializes automatic and manual recovery jobs", async () => {
    const firstWork = deferred();
    const hydrate = vi.fn().mockResolvedValue(undefined);
    const secondWork = vi.fn().mockResolvedValue(undefined);

    const firstRecovery = runOfflineRecovery(() => firstWork.promise, hydrate);
    const secondRecovery = runOfflineRecovery(secondWork, hydrate);
    await Promise.resolve();

    expect(secondWork).not.toHaveBeenCalled();
    firstWork.resolve();
    await Promise.all([firstRecovery, secondRecovery]);

    expect(secondWork).toHaveBeenCalledOnce();
  });
});
