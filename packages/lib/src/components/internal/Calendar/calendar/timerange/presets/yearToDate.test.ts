import { describe, expect, test } from 'vitest';
import { getDateRangeContext, TIMEZONE_TESTS_TIMESTAMPS } from './testing/fixtures';
import { asTimestamp } from './testing/helpers';
import yearToDate from './yearToDate';

describe('year to date', () => {
    test('should be current year', () => {
        const { fromDate, nowDate, toDate } = getDateRangeContext(yearToDate);
        const fromMonth = fromDate.getMonth();
        const fromYear = fromDate.getFullYear();
        const nowMonth = nowDate.getMonth();
        const nowYear = nowDate.getFullYear();
        const toMonth = toDate.getMonth();
        const toYear = toDate.getFullYear();

        expect(fromYear).toBe(nowYear); // current year
        expect(fromMonth).toBe(0); // first month

        expect(toYear).toBe(nowYear); // same year
        expect(toMonth).toBe(nowMonth); // current month

        expect(fromDate.getDate()).toBe(1); // first day of month
        expect(toDate.getDate()).toBe(nowDate.getDate()); // today
    });

    test('should have precise timestamps', () => {
        const { from, fromDate, now, to } = getDateRangeContext(yearToDate);
        const dateBefore = new Date(from - 1);
        const fromYear = fromDate.getFullYear();
        const monthBefore = dateBefore.getMonth();
        const yearBefore = dateBefore.getFullYear();

        expect(to).toBe(now);
        expect(monthBefore).toBe(11);
        expect(yearBefore).toBe(fromYear - 1);
    });

    test('should have precise timestamps for timezone', () => {
        const range = getDateRangeContext(yearToDate);
        const { now: initialNow, timezone: initialTimezone } = range;

        const TIMEZONES = new Map([
            ['America/Toronto', asTimestamp(['Jan 1, 2022, 12:00 AM GMT-5', 'Jan 1, 2023, 12:00 AM GMT-5', 'Jan 1, 2023, 12:00 AM GMT-5'])],
            ['Asia/Tokyo', asTimestamp(['Jan 1, 2022, 12:00 AM GMT+9', 'Jan 1, 2024, 12:00 AM GMT+9', 'Jan 1, 2024, 12:00 AM GMT+9'])],
        ]);

        TIMEZONES.forEach((fromTimestamps, timezone) => {
            range.timezone = timezone;

            TIMEZONE_TESTS_TIMESTAMPS.forEach((timestamp, index) => {
                range.now = timestamp;
                expect(range.from).toBe(fromTimestamps[index]); // start of year for `timezone`
                expect(range.to).toBe(timestamp); // always the `now` timestamp
            });

            // reset now and tz
            range.now = initialNow;
            range.timezone = initialTimezone;
        });
    });
});
