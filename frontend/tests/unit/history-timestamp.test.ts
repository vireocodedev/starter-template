import { createHistoryTimestampFormatter } from "@/features/history/public";
import { describe, expect, it } from "vitest";

const now = Date.parse("2026-08-29T12:00:00Z");

describe("history timestamp formatting", () => {
  it("uses native localized relative time for recent history", () => {
    const format = createHistoryTimestampFormatter("en");

    expect(format("2026-08-29T11:55:00Z", now)).toMatchObject({
      dateTime: "2026-08-29T11:55:00.000Z",
      display: "5 minutes ago",
      relative: true,
    });
  });

  it("uses the locale supplied by the application", () => {
    const format = createHistoryTimestampFormatter("hr");

    expect(format("2026-08-29T10:00:00Z", now).display).toBe(
      new Intl.RelativeTimeFormat("hr", { numeric: "auto" }).format(-2, "hour"),
    );
  });

  it("uses an exact localized timestamp at and beyond seven days", () => {
    const timestamp = "2026-08-22T12:00:00Z";
    const format = createHistoryTimestampFormatter("en");
    const result = format(timestamp, now);

    expect(result).toMatchObject({
      dateTime: "2026-08-22T12:00:00.000Z",
      display: new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp)),
      relative: false,
    });
    expect(result.exact).toBe(result.display);
  });

  it("falls back safely when the API returns an invalid timestamp", () => {
    const format = createHistoryTimestampFormatter("en");

    expect(format("invalid", now)).toEqual({
      display: "invalid",
      exact: "invalid",
      relative: false,
    });
  });
});
