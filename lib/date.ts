// Bangladesh Standard Time helpers.
//
// BST is a fixed UTC+6 offset year-round (no DST), so we can build exact
// day boundaries with a literal `+06:00` offset — correct regardless of the
// server's own timezone (production usually runs in UTC). Display uses the
// `Asia/Dhaka` IANA zone so dates always read in Bangladesh local time.

const DHAKA_TZ = 'Asia/Dhaka';
const YMD_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Format a date as "DD MMM YYYY" in Bangladesh time (e.g. "15 Jan 2025"). */
export function formatDhakaDate(date: Date | string | number): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: DHAKA_TZ,
  });
}

/** Format a date as "DD MMM YYYY, HH:mm" in Bangladesh time. */
export function formatDhakaDateTime(date: Date | string | number): string {
  return new Date(date).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: DHAKA_TZ,
  });
}

/** Today's date in Bangladesh as `YYYY-MM-DD`. */
export function dhakaToday(): string {
  // en-CA renders ISO-style YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone: DHAKA_TZ }).format(new Date());
}

/** Shift a `YYYY-MM-DD` string by `days` (can be negative), returning `YYYY-MM-DD`. */
export function shiftDay(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/** First day of the current Bangladesh month as `YYYY-MM-DD`. */
export function dhakaMonthStart(): string {
  return dhakaToday().slice(0, 8) + '01';
}

/** Start instant (00:00:00.000 BST) of a Bangladesh calendar day, as a UTC Date. */
export function dhakaDayStart(ymd: string): Date {
  return new Date(`${ymd}T00:00:00.000+06:00`);
}

/** End instant (23:59:59.999 BST) of a Bangladesh calendar day, as a UTC Date. */
export function dhakaDayEnd(ymd: string): Date {
  return new Date(`${ymd}T23:59:59.999+06:00`);
}

/** True if `s` is a well-formed, real `YYYY-MM-DD` date string. */
export function isValidYmd(s: string | undefined | null): s is string {
  if (!s || !YMD_RE.test(s)) return false;
  return !Number.isNaN(new Date(`${s}T00:00:00+06:00`).getTime());
}
