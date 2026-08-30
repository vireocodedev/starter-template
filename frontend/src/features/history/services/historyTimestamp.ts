const SECOND_IN_MILLISECONDS = 1_000;
const MINUTE_IN_MILLISECONDS = 60 * SECOND_IN_MILLISECONDS;
const HOUR_IN_MILLISECONDS = 60 * MINUTE_IN_MILLISECONDS;
const DAY_IN_MILLISECONDS = 24 * HOUR_IN_MILLISECONDS;
const RELATIVE_TIME_WINDOW_IN_MILLISECONDS = 7 * DAY_IN_MILLISECONDS;

const relativeUnits = [
  { unit: "day", milliseconds: DAY_IN_MILLISECONDS },
  { unit: "hour", milliseconds: HOUR_IN_MILLISECONDS },
  { unit: "minute", milliseconds: MINUTE_IN_MILLISECONDS },
  { unit: "second", milliseconds: SECOND_IN_MILLISECONDS },
] as const;

export type HistoryTimestampPresentation = {
  dateTime?: string;
  display: string;
  exact: string;
  relative: boolean;
};

export type HistoryTimestampFormatter = (timestamp: string | number, now?: number) => HistoryTimestampPresentation;

export function createHistoryTimestampFormatter(locale?: string): HistoryTimestampFormatter {
  const dateTimeFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const relativeTimeFormatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  return (timestamp, now = Date.now()) => {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      const fallback = String(timestamp);
      return { display: fallback, exact: fallback, relative: false };
    }

    const exact = dateTimeFormatter.format(date);
    const difference = date.getTime() - now;
    const absoluteDifference = Math.abs(difference);

    if (absoluteDifference >= RELATIVE_TIME_WINDOW_IN_MILLISECONDS) {
      return { dateTime: date.toISOString(), display: exact, exact, relative: false };
    }

    const relativeUnit = relativeUnits.find(({ milliseconds }) => absoluteDifference >= milliseconds);
    const display = relativeUnit
      ? relativeTimeFormatter.format(Math.trunc(difference / relativeUnit.milliseconds), relativeUnit.unit)
      : relativeTimeFormatter.format(0, "second");

    return { dateTime: date.toISOString(), display, exact, relative: true };
  };
}
