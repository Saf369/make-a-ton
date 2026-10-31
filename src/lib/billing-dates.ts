/**
 * Billing Dates & Anchor Calculation Engine for Brightloop Hub
 * Follows PROJECT_SPEC.md & BRIGHTLOOP_MASTER_IMPLEMENTATION_PLAN.md Section 2.4 & 7.8
 * 
 * Rules:
 * 1. Business Timezone: Default 'Asia/Kolkata' (UTC+05:30) as specified in master plan.
 * 2. Storage: All database timestamps are strict UTC ISO 8601 strings.
 * 3. Handles DAY, WEEK, MONTH, and YEAR intervals.
 * 4. Preserves monthly billing anchors for 29th, 30th, 31st month ends:
 *    E.g. A subscription anchored on the 31st:
 *    - Jan 31 -> Feb 28 (or Feb 29 in leap year) -> Mar 31 -> Apr 30 -> May 31.
 * 5. Idempotency window computation for recurring billing.
 */

export type BillingInterval = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export const DEFAULT_BUSINESS_TIMEZONE = 'Asia/Kolkata';

export interface BillingPeriodResult {
  periodStart: Date;
  periodEnd: Date;
  nextBillingDate: Date;
  periodStartISO: string;
  periodEndISO: string;
  nextBillingDateISO: string;
  timezone: string;
}

export interface ZonedDateParts {
  year: number;
  month: number; // 1-indexed (1 = Jan, 12 = Dec)
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/**
 * Returns the maximum days in a given month (1-indexed month: 1=Jan, 2=Feb, etc.).
 */
export function getDaysInMonth(year: number, monthOneIndexed: number): number {
  return new Date(Date.UTC(year, monthOneIndexed, 0)).getUTCDate();
}

/**
 * Checks if a year is a leap year.
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Extracts date parts in a specific timezone (default: Asia/Kolkata) using Intl.DateTimeFormat.
 */
export function getZonedDateParts(
  dateInput: Date | string,
  timeZone: string = DEFAULT_BUSINESS_TIMEZONE
): ZonedDateParts {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date input for getZonedDateParts: ${dateInput}`);
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });

  const parts = formatter.formatToParts(d);
  const partMap: Record<string, number> = {};

  for (const part of parts) {
    if (part.type !== 'literal') {
      partMap[part.type] = parseInt(part.value, 10);
    }
  }

  return {
    year: partMap.year || d.getUTCFullYear(),
    month: partMap.month || (d.getUTCMonth() + 1),
    day: partMap.day || d.getUTCDate(),
    hour: partMap.hour !== undefined ? (partMap.hour === 24 ? 0 : partMap.hour) : d.getUTCHours(),
    minute: partMap.minute || d.getUTCMinutes(),
    second: partMap.second || d.getUTCSeconds()
  };
}

/**
 * Formats a Date to YYYY-MM-DD UTC string for database date columns.
 */
export function formatDateISO(dateInput: Date | string): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

/**
 * Formats a Date to full UTC ISO 8601 string (e.g. 2026-10-31T06:30:00.000Z) for database timestamptz.
 */
export function formatDateTimeISO(dateInput: Date | string): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toISOString();
}

/**
 * Computes the next billing date given an interval and an anchor day of month.
 * Preserves month-end anchor days (e.g. 31st) across variable month lengths.
 */
export function calculateNextBillingDate(
  currentDateInput: Date | string,
  interval: BillingInterval,
  anchorDay?: number
): Date {
  const current = new Date(currentDateInput);
  if (isNaN(current.getTime())) {
    throw new Error(`Invalid date input for calculateNextBillingDate: ${currentDateInput}`);
  }

  // Anchor day defaults to the day of the initial start date
  const anchor = anchorDay !== undefined ? anchorDay : current.getUTCDate();

  const next = new Date(current.getTime());

  switch (interval) {
    case 'DAY': {
      next.setUTCDate(next.getUTCDate() + 1);
      return next;
    }

    case 'WEEK': {
      next.setUTCDate(next.getUTCDate() + 7);
      return next;
    }

    case 'MONTH': {
      const currentYear = next.getUTCFullYear();
      const currentMonth = next.getUTCMonth(); // 0-indexed

      // Target next month
      let targetYear = currentYear;
      let targetMonth = currentMonth + 1;
      if (targetMonth > 11) {
        targetYear += 1;
        targetMonth = 0;
      }

      // Find max days in target month
      const maxDaysInTarget = getDaysInMonth(targetYear, targetMonth + 1);
      // Clamp anchor to max days in target month
      const targetDay = Math.min(anchor, maxDaysInTarget);

      return new Date(Date.UTC(
        targetYear,
        targetMonth,
        targetDay,
        current.getUTCHours(),
        current.getUTCMinutes(),
        current.getUTCSeconds(),
        current.getUTCMilliseconds()
      ));
    }

    case 'YEAR': {
      const targetYear = next.getUTCFullYear() + 1;
      const targetMonth = next.getUTCMonth();

      // Handle leap year edge case: Feb 29
      const maxDaysInTarget = getDaysInMonth(targetYear, targetMonth + 1);
      const targetDay = Math.min(anchor, maxDaysInTarget);

      return new Date(Date.UTC(
        targetYear,
        targetMonth,
        targetDay,
        current.getUTCHours(),
        current.getUTCMinutes(),
        current.getUTCSeconds(),
        current.getUTCMilliseconds()
      ));
    }

    default:
      throw new Error(`Unsupported billing interval: ${interval}`);
  }
}

/**
 * Calculates a complete billing period with periodStart, periodEnd, and nextBillingDate.
 * Period end is typically 1 millisecond before next billing date or the day prior.
 */
export function calculateBillingPeriod(
  startDateInput: Date | string,
  interval: BillingInterval,
  anchorDay?: number,
  timeZone: string = DEFAULT_BUSINESS_TIMEZONE
): BillingPeriodResult {
  const periodStart = new Date(startDateInput);
  if (isNaN(periodStart.getTime())) {
    throw new Error(`Invalid date input for calculateBillingPeriod: ${startDateInput}`);
  }

  const anchor = anchorDay !== undefined ? anchorDay : periodStart.getUTCDate();
  const nextBillingDate = calculateNextBillingDate(periodStart, interval, anchor);

  // Period end is the end of the interval (1 millisecond before next billing date)
  const periodEnd = new Date(nextBillingDate.getTime() - 1);

  return {
    periodStart,
    periodEnd,
    nextBillingDate,
    periodStartISO: formatDateISO(periodStart),
    periodEndISO: formatDateISO(periodEnd),
    nextBillingDateISO: formatDateISO(nextBillingDate),
    timezone: timeZone
  };
}

/**
 * Checks if an active subscription is due for recurring billing.
 * A subscription is due when nextBillingAt <= referenceDate (defaulting to current time).
 */
export function isSubscriptionDueForBilling(
  nextBillingAt: Date | string | null | undefined,
  referenceDateInput?: Date | string
): boolean {
  if (!nextBillingAt) return false;

  const nextDue = new Date(nextBillingAt).getTime();
  if (isNaN(nextDue)) return false;

  const ref = referenceDateInput ? new Date(referenceDateInput).getTime() : Date.now();
  return nextDue <= ref;
}

/**
 * Checks if a given timestamp is valid and within an active date range [startDate, endDate].
 */
export function isWithinDateRange(
  checkDateInput: Date | string,
  startDateInput?: Date | string | null,
  endDateInput?: Date | string | null
): boolean {
  const check = new Date(checkDateInput).getTime();
  if (isNaN(check)) return false;

  if (startDateInput) {
    const start = new Date(startDateInput).getTime();
    if (!isNaN(start) && check < start) return false;
  }

  if (endDateInput) {
    const end = new Date(endDateInput).getTime();
    if (!isNaN(end) && check > end) return false;
  }

  return true;
}
