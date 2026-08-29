import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  classifyAppAuthFailure,
  type AppAuthFailureKind,
  type AppAuthOperation,
} from "@/app/data/network/models/AppAuthFailure";

function httpFailure(status: number): AxiosError {
  return new AxiosError("Authentication failed", undefined, undefined, undefined, {
    status,
  } as AxiosResponse);
}

describe("authentication failure taxonomy", () => {
  it.each<[string, unknown, AppAuthOperation, AppAuthFailureKind]>([
    ["bootstrap 401", httpFailure(401), "bootstrap", "unauthenticated"],
    ["login 401", httpFailure(401), "login", "invalid-credentials"],
    ["authenticated request 401", httpFailure(401), "session", "expired-session"],
    ["403", httpFailure(403), "login", "forbidden"],
    ["419", httpFailure(419), "bootstrap", "expired-session"],
    ["440", httpFailure(440), "bootstrap", "expired-session"],
    ["network failure", new AxiosError("Network Error"), "login", "offline"],
    ["timeout", new AxiosError("timeout", "ECONNABORTED"), "login", "offline"],
    ["5xx", httpFailure(503), "login", "server"],
    [
      "invalid payload",
      z.object({ username: z.string() }).safeParse({ username: 42 }).error,
      "login",
      "malformed-response",
    ],
    ["logout", httpFailure(503), "logout", "logout-failure"],
  ])("classifies %s", (_label, error, operation, expected) => {
    expect(classifyAppAuthFailure(error, operation)).toEqual({ kind: expected });
  });
});
