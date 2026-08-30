import React from "react";
import { vi } from "vitest";

let initialNeedRefresh = false;
let initialOfflineReady = false;
let initialRegistrationError: unknown = null;
let initialRegistration: ServiceWorkerRegistration | null = null;

export const updateServiceWorkerMock = vi.fn(async () => undefined);
export const registrationUpdateMock = vi.fn(async () => undefined);

export function setPwaRegistrationState({
  needRefresh = false,
  offlineReady = false,
  registrationError = null,
  registration = null,
}: {
  needRefresh?: boolean;
  offlineReady?: boolean;
  registrationError?: unknown;
  registration?: ServiceWorkerRegistration | null;
}) {
  initialNeedRefresh = needRefresh;
  initialOfflineReady = offlineReady;
  initialRegistrationError = registrationError;
  initialRegistration = registration;
}

export function resetPwaRegistrationState() {
  initialNeedRefresh = false;
  initialOfflineReady = false;
  initialRegistrationError = null;
  initialRegistration = null;
  updateServiceWorkerMock.mockClear();
  registrationUpdateMock.mockReset();
  registrationUpdateMock.mockResolvedValue(undefined);
}

export function useRegisterSW(options?: {
  onRegisterError?: (error: unknown) => void;
  onRegisteredSW?: (serviceWorkerUrl: string, registration: ServiceWorkerRegistration | undefined) => void;
}) {
  const reportedRegistrationError = React.useRef(false);
  const reportedRegistration = React.useRef(false);
  React.useEffect(() => {
    if (!initialRegistrationError || reportedRegistrationError.current) return;
    reportedRegistrationError.current = true;
    options?.onRegisterError?.(initialRegistrationError);
  }, [options]);
  React.useEffect(() => {
    if (!initialRegistration || reportedRegistration.current) return;
    reportedRegistration.current = true;
    options?.onRegisteredSW?.("/sw.js", initialRegistration);
  }, [options]);
  return {
    needRefresh: React.useState(initialNeedRefresh),
    offlineReady: React.useState(initialOfflineReady),
    updateServiceWorker: updateServiceWorkerMock,
  };
}
