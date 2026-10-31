import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateNextBillingDate,
  calculateBillingPeriod,
  isSubscriptionDueForBilling,
  isWithinDateRange,
  formatDateISO,
  formatDateTimeISO,
  getDaysInMonth,
  isLeapYear,
  getZonedDateParts,
  DEFAULT_BUSINESS_TIMEZONE
} from '../src/lib/billing-dates.ts';

describe('Billing Dates & Anchor Calculation Engine (billing-dates.ts)', () => {
  it('identifies leap years accurately', () => {
    assert.equal(isLeapYear(2024), true);
    assert.equal(isLeapYear(2026), false);
    assert.equal(isLeapYear(2028), true);
    assert.equal(isLeapYear(2000), true);
    assert.equal(isLeapYear(1900), false);
  });

  it('determines days in months correctly', () => {
    assert.equal(getDaysInMonth(2026, 1), 31); // Jan
    assert.equal(getDaysInMonth(2026, 2), 28); // Feb (non-leap)
    assert.equal(getDaysInMonth(2024, 2), 29); // Feb (leap)
    assert.equal(getDaysInMonth(2026, 4), 30); // Apr
  });

  it('calculates DAY interval (+1 day)', () => {
    const next = calculateNextBillingDate('2026-10-15T00:00:00Z', 'DAY');
    assert.equal(formatDateISO(next), '2026-10-16');
  });

  it('calculates WEEK interval (+7 days)', () => {
    const next = calculateNextBillingDate('2026-10-15T00:00:00Z', 'WEEK');
    assert.equal(formatDateISO(next), '2026-10-22');
  });

  it('calculates standard MONTH interval (+1 month)', () => {
    const next = calculateNextBillingDate('2026-03-15T00:00:00Z', 'MONTH');
    assert.equal(formatDateISO(next), '2026-04-15');
  });

  it('preserves 31st month-end anchor across variable month lengths (Feb, Apr, etc.)', () => {
    // Jan 31 in non-leap year (2026) -> Feb 28
    const feb = calculateNextBillingDate('2026-01-31T00:00:00Z', 'MONTH', 31);
    assert.equal(formatDateISO(feb), '2026-02-28');

    // Feb 28 with anchor 31 -> Mar 31 (recovers to 31!)
    const mar = calculateNextBillingDate('2026-02-28T00:00:00Z', 'MONTH', 31);
    assert.equal(formatDateISO(mar), '2026-03-31');

    // Mar 31 with anchor 31 -> Apr 30 (Apr only has 30 days)
    const apr = calculateNextBillingDate('2026-03-31T00:00:00Z', 'MONTH', 31);
    assert.equal(formatDateISO(apr), '2026-04-30');

    // Apr 30 with anchor 31 -> May 31
    const may = calculateNextBillingDate('2026-04-30T00:00:00Z', 'MONTH', 31);
    assert.equal(formatDateISO(may), '2026-05-31');
  });

  it('handles leap year Feb 29 anchor correctly', () => {
    // Jan 31 in leap year (2024) -> Feb 29
    const feb2024 = calculateNextBillingDate('2024-01-31T00:00:00Z', 'MONTH', 31);
    assert.equal(formatDateISO(feb2024), '2024-02-29');

    // Feb 29 in 2024 -> next year 2025 (non-leap) -> Feb 28
    const feb2025 = calculateNextBillingDate('2024-02-29T00:00:00Z', 'YEAR', 29);
    assert.equal(formatDateISO(feb2025), '2025-02-28');
  });

  it('calculates full billing period structure with timezone specification', () => {
    const period = calculateBillingPeriod('2026-10-01T00:00:00Z', 'MONTH', 1, DEFAULT_BUSINESS_TIMEZONE);
    assert.equal(period.periodStartISO, '2026-10-01');
    assert.equal(period.nextBillingDateISO, '2026-11-01');
    assert.equal(period.periodEndISO, '2026-10-31');
    assert.equal(period.timezone, 'Asia/Kolkata');
  });

  it('evaluates whether a subscription is due for recurring billing', () => {
    const pastDue = '2026-10-15T00:00:00Z';
    const futureDue = '2026-11-15T00:00:00Z';
    const refDate = '2026-10-20T00:00:00Z';

    assert.equal(isSubscriptionDueForBilling(pastDue, refDate), true);
    assert.equal(isSubscriptionDueForBilling(futureDue, refDate), false);
    assert.equal(isSubscriptionDueForBilling(null, refDate), false);
  });

  it('checks if a date is within an active promotion date range', () => {
    const valid = isWithinDateRange('2026-10-15', '2026-10-01', '2026-10-31');
    assert.equal(valid, true);

    const expired = isWithinDateRange('2026-11-05', '2026-10-01', '2026-10-31');
    assert.equal(expired, false);

    const premature = isWithinDateRange('2026-09-25', '2026-10-01', '2026-10-31');
    assert.equal(premature, false);
  });

  it('correctly maps UTC timestamp to Asia/Kolkata (IST = UTC+05:30)', () => {
    // 2026-10-31 00:00:00 UTC is 2026-10-31 05:30:00 IST
    const parts = getZonedDateParts('2026-10-31T00:00:00Z', 'Asia/Kolkata');
    assert.equal(parts.year, 2026);
    assert.equal(parts.month, 10);
    assert.equal(parts.day, 31);
    assert.equal(parts.hour, 5);
    assert.equal(parts.minute, 30);

    // 2026-10-31 20:00:00 UTC crosses into next day in IST (Nov 1, 01:30:00 AM)
    const nextDayParts = getZonedDateParts('2026-10-31T20:00:00Z', 'Asia/Kolkata');
    assert.equal(nextDayParts.year, 2026);
    assert.equal(nextDayParts.month, 11);
    assert.equal(nextDayParts.day, 1);
    assert.equal(nextDayParts.hour, 1);
    assert.equal(nextDayParts.minute, 30);
  });
});
