import React from "react";
import { vi } from "vitest";

let initialNeedRefresh = false;
let initialOfflineReady = false;

export const updateServiceWorkerMock = vi.fn(async () => undefined);

export function setPwaRegistrationState({
  needRefresh = false,
  offlineReady = false,
}: {
  needRefresh?: boolean;
  offlineReady?: boolean;
}) {
  initialNeedRefresh = needRefresh;
  initialOfflineReady = offlineReady;
}

export function resetPwaRegistrationState() {
  initialNeedRefresh = false;
  initialOfflineReady = false;
  updateServiceWorkerMock.mockClear();
}

export function useRegisterSW() {
  return {
    needRefresh: React.useState(initialNeedRefresh),
    offlineReady: React.useState(initialOfflineReady),
    updateServiceWorker: updateServiceWorkerMock,
  };
}
