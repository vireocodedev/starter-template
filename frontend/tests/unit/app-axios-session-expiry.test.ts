import type { AxiosAdapter } from "axios";
import { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appAxios } from "@/app/data/network/clients/AppAxiosClient";
import { appSessionExpiry } from "@/app/data/network/services/appSessionExpiry";

const unauthorizedAdapter: AxiosAdapter = config =>
  Promise.reject(
    new AxiosError("Unauthorized", AxiosError.ERR_BAD_REQUEST, config, undefined, {
      config,
      data: undefined,
      headers: {},
      status: 401,
      statusText: "Unauthorized",
    }),
  );

describe("application Axios session expiry", () => {
  beforeEach(() => appSessionExpiry.reset());

  it("notifies once when an ordinary API request receives an unauthorized response", async () => {
    const listener = vi.fn();
    const unsubscribe = appSessionExpiry.subscribe(listener);

    await expect(appAxios.get("items", { adapter: unauthorizedAdapter })).rejects.toBeInstanceOf(AxiosError);
    await expect(appAxios.get("items", { adapter: unauthorizedAdapter })).rejects.toBeInstanceOf(AxiosError);

    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("leaves authentication endpoint failures to the authentication flow", async () => {
    const listener = vi.fn();
    const unsubscribe = appSessionExpiry.subscribe(listener);

    await expect(appAxios.get("auth/me", { adapter: unauthorizedAdapter })).rejects.toBeInstanceOf(AxiosError);

    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });
});
