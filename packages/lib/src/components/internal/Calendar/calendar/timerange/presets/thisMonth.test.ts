import { describe, expect, test } from 'vitest';
import { asTimestamp, getDateRangeContext, TIMEZONE_TESTS_TIMESTAMPS } from './shared/test-utils';
import thisMonth from './thisMonth';

describe('this month', () => {
    test('should be current month', () => {
        const { fromDate, nowDate, toDate } = getDateRangeContext(thisMonth);
        const fromMonth = fromDate.getMonth();
        const fromYear = fromDate.getFullYear();
        const nowMonth = nowDate.getMonth();
        const nowYear = nowDate.getFullYear();
        const toMonth = toDate.getMonth();
        const toYear = toDate.getFullYear();

        expect(fromYear).toBe(nowYear); // current year
        expect(fromMonth).toBe(nowMonth); // current month

        expect(fromYear).toBe(toYear); // same year
        expect(fromMonth).toBe(toMonth); // same month
        expect(fromDate.getDate()).toBe(1); // first day of month
        expect(toDate.getDate()).toBe(nowDate.getDate()); // today
    });

    test('should have precise timestamps', () => {
        const { nowDate, from, now, to } = getDateRangeContext(thisMonth);
        const nowMonth = nowDate.getMonth();
        const monthBefore = new Date(from - 1).getMonth();

        expect(to).toBe(now);

        nowMonth === 0 ? expect(monthBefore).toBe(11) : expect(monthBefore).toBe(nowMonth - 1);
    });

    test('should have precise timestamps for timezone', () => {
        const range = getDateRangeContext(thisMonth);
        const { now: initialNow, tz: initialTz } = range;

        const TIMEZONES = new Map([
            ['America/Toronto', asTimestamp(['Apr 1, 2022, 12:00 AM GMT-4', 'Dec 1, 2023, 12:00 AM GMT-5', 'Dec 1, 2023, 12:00 AM GMT-5'])],
            ['Asia/Tokyo', asTimestamp(['Apr 1, 2022, 12:00 AM GMT+9', 'Jan 1, 2024, 12:00 AM GMT+9', 'Jan 1, 2024, 12:00 AM GMT+9'])],
        ]);

        TIMEZONES.forEach((fromTimestamps, timezone) => {
            range.tz = timezone;

            TIMEZONE_TESTS_TIMESTAMPS.forEach((timestamp, index) => {
                range.now = timestamp;
                expect(range.from).toBe(fromTimestamps[index]); // start of month for `timezone`
                expect(range.to).toBe(timestamp); // always the `now` timestamp
            });

            // reset now and tz
            range.now = initialNow;
            range.tz = initialTz;
        });
    });
});
