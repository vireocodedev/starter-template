import React from "react";
import { appConfig } from "@/app/config/app-config";
import { PWA_POLICY } from "../../../pwa-policy.mjs";

export type AppConnectivityStatus = "browser-offline" | "checking" | "reachable" | "unavailable" | "mock";

export type AppConnectivity = Readonly<{
  status: AppConnectivityStatus;
  browserOnline: boolean;
}>;

export const APP_CONNECTIVITY_CHECK_INTERVAL_MS = 30_000;
export const APP_CONNECTIVITY_TIMEOUT_MS = 4_000;

function browserOnline(): boolean {
  return typeof navigator === "undefined" || navigator.onLine;
}

/** A received HTTP response proves reachability even when the service returns 4xx or 5xx. */
export async function checkBackendReadiness({
  fetchImpl = fetch,
  signal,
}: {
  fetchImpl?: typeof fetch;
  signal: AbortSignal;
}): Promise<void> {
  await fetchImpl(PWA_POLICY.readinessPath, {
    cache: "no-store",
    credentials: "same-origin",
    signal,
  });
}

function initialConnectivity(): AppConnectivity {
  if (appConfig.apiMode === "mock") return { status: "mock", browserOnline: true };
  const online = browserOnline();
  return { status: online ? "checking" : "browser-offline", browserOnline: online };
}

/**
 * Browser `online` is only a transport hint. This hook additionally probes the
 * same-origin readiness endpoint, aborts superseded work, and treats every HTTP
 * response (including 401/403/5xx) as evidence that the backend was reached.
 */
export function useAppConnectivity(): AppConnectivity {
  const connectivityRef = React.useRef<AppConnectivity>(initialConnectivity());
  const [connectivity, setConnectivityState] = React.useState<AppConnectivity>(connectivityRef.current);
  const activeController = React.useRef<AbortController | null>(null);
  const disposed = React.useRef(false);

  const setConnectivity = React.useCallback((next: AppConnectivity) => {
    connectivityRef.current = next;
    setConnectivityState(next);
  }, []);

  const check = React.useCallback(async () => {
    if (appConfig.apiMode === "mock") {
      setConnectivity({ status: "mock", browserOnline: true });
      return;
    }

    const online = browserOnline();
    if (!online) {
      activeController.current?.abort();
      setConnectivity({ status: "browser-offline", browserOnline: false });
      return;
    }

    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, APP_CONNECTIVITY_TIMEOUT_MS);
    if (connectivityRef.current.status !== "reachable") {
      setConnectivity({ status: "checking", browserOnline: true });
    }

    try {
      await checkBackendReadiness({ signal: controller.signal });
      if (!disposed.current && activeController.current === controller) {
        setConnectivity({ status: "reachable", browserOnline: true });
      }
    } catch {
      if (!disposed.current && activeController.current === controller && (timedOut || !controller.signal.aborted)) {
        setConnectivity({ status: "unavailable", browserOnline: true });
      }
    } finally {
      window.clearTimeout(timeout);
      if (activeController.current === controller) activeController.current = null;
    }
  }, [setConnectivity]);

  React.useEffect(() => {
    disposed.current = false;
    void check();
    const handleOnline = () => void check();
    const handleOffline = () => {
      activeController.current?.abort();
      setConnectivity({ status: "browser-offline", browserOnline: false });
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    const interval = window.setInterval(() => void check(), APP_CONNECTIVITY_CHECK_INTERVAL_MS);

    return () => {
      disposed.current = true;
      activeController.current?.abort();
      window.clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [check, setConnectivity]);

  return connectivity;
}
