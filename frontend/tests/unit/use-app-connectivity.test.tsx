import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PWA_POLICY } from "../../pwa-policy.mjs";
import {
  APP_CONNECTIVITY_CHECK_INTERVAL_MS,
  checkBackendReadiness,
  useAppConnectivity,
} from "@/app/connectivity/useAppConnectivity";

const originalOnlineDescriptor = Object.getOwnPropertyDescriptor(navigator, "onLine");

function setBrowserOnline(online: boolean) {
  Object.defineProperty(navigator, "onLine", { configurable: true, value: online });
}

afterEach(() => {
  if (originalOnlineDescriptor) Object.defineProperty(navigator, "onLine", originalOnlineDescriptor);
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("checkBackendReadiness", () => {
  it.each([401, 403, 500, 503])("treats HTTP %i as proof that the backend is reachable", async status => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response("", { status }));

    await expect(checkBackendReadiness({ fetchImpl, signal: new AbortController().signal })).resolves.toBeUndefined();
    expect(fetchImpl).toHaveBeenCalledWith(
      PWA_POLICY.readinessPath,
      expect.objectContaining({ cache: "no-store", credentials: "same-origin" }),
    );
  });
});

describe("useAppConnectivity", () => {
  it("reports browser-offline without probing the backend", () => {
    setBrowserOnline(false);
    const fetchImpl = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchImpl);

    const { result } = renderHook(() => useAppConnectivity());

    expect(result.current).toEqual({ status: "browser-offline", browserOnline: false });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("distinguishes an unavailable backend from browser offline", async () => {
    setBrowserOnline(true);
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockRejectedValue(new TypeError("network unavailable")));

    const { result } = renderHook(() => useAppConnectivity());

    expect(result.current.status).toBe("checking");
    await waitFor(() => expect(result.current).toEqual({ status: "unavailable", browserOnline: true }));
  });

  it("keeps a reachable state visible while the background probe is in flight", async () => {
    vi.useFakeTimers();
    setBrowserOnline(true);
    let resolveBackgroundProbe!: (response: Response) => void;
    const backgroundProbe = new Promise<Response>(resolve => {
      resolveBackgroundProbe = resolve;
    });
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(new Response("", { status: 200 }))
        .mockImplementationOnce(async () => await backgroundProbe),
    );

    const { result } = renderHook(() => useAppConnectivity());
    await act(async () => undefined);
    expect(result.current).toEqual({ status: "reachable", browserOnline: true });

    act(() => vi.advanceTimersByTime(APP_CONNECTIVITY_CHECK_INTERVAL_MS));
    expect(result.current).toEqual({ status: "reachable", browserOnline: true });

    await act(async () => resolveBackgroundProbe(new Response("", { status: 200 })));
    expect(result.current).toEqual({ status: "reachable", browserOnline: true });
  });
});
