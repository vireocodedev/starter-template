import axios from "axios";
import { z } from "zod";

export type AppAuthFailureKind =
  | "unauthenticated"
  | "invalid-credentials"
  | "forbidden"
  | "expired-session"
  | "offline"
  | "server"
  | "malformed-response"
  | "logout-failure";

export type AppAuthFailure = Readonly<{
  kind: AppAuthFailureKind;
}>;

export type AppAuthOperation = "bootstrap" | "login" | "session" | "logout";

export class AppAuthFailureError extends Error {
  readonly failure: AppAuthFailure;

  constructor(failure: AppAuthFailure, cause?: unknown) {
    super(`Authentication operation failed: ${failure.kind}`, { cause });
    this.name = "AppAuthFailureError";
    this.failure = failure;
  }
}

function isMalformedResponse(error: unknown): boolean {
  return error instanceof z.ZodError || (error instanceof Error && error.name === "ZodError");
}

/** Converts transport and response-validation failures into safe UI-facing auth outcomes. */
export function classifyAppAuthFailure(error: unknown, operation: AppAuthOperation): AppAuthFailure {
  if (error instanceof AppAuthFailureError) return error.failure;
  if (operation === "logout") return { kind: "logout-failure" };
  if (isMalformedResponse(error)) return { kind: "malformed-response" };

  if (axios.isAxiosError(error)) {
    if (!error.response || error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return { kind: "offline" };
    }

    const status = error.response.status;
    if (status === 401) {
      if (operation === "login") return { kind: "invalid-credentials" };
      if (operation === "session") return { kind: "expired-session" };
      return { kind: "unauthenticated" };
    }
    if (status === 403) return { kind: "forbidden" };
    if (status === 419 || status === 440) return { kind: "expired-session" };
    if (status >= 500) return { kind: "server" };
  }

  return { kind: "server" };
}

export function toAppAuthFailureError(error: unknown, operation: AppAuthOperation): AppAuthFailureError {
  return error instanceof AppAuthFailureError
    ? error
    : new AppAuthFailureError(classifyAppAuthFailure(error, operation), error);
}
