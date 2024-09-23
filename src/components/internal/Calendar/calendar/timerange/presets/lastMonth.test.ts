import { describe, expect, test } from 'vitest';
import { getDateRangeContext, TIMEZONE_TESTS_TIMESTAMPS } from './testing/fixtures';
import { asTimestamp, getMonthDays } from './testing/helpers';
import type { Month } from '../../types';
import lastMonth from './lastMonth';

describe('last month', () => {
    test('should be previous month', () => {
        const { fromDate, nowDate, toDate } = getDateRangeContext(lastMonth);
        const fromMonth = fromDate.getMonth();
        const fromYear = fromDate.getFullYear();
        const fromMonthDays = getMonthDays(fromMonth as Month, fromYear);
        const nowMonth = nowDate.getMonth();
        const nowYear = nowDate.getFullYear();
        const toMonth = toDate.getMonth();
        const toYear = toDate.getFullYear();

        expect(fromYear).toBe(toYear); // same year
        expect(fromMonth).toBe(toMonth); // same month
        expect(fromDate.getDate()).toBe(1); // first day of month
        expect(toDate.getDate()).toBe(fromMonthDays); // last day of month

        if (nowMonth === 0) {
            expect(fromMonth).toBe(11); // last month of year
            expect(fromYear).toBe(nowYear - 1); // previous year
        } else {
            expect(fromMonth).toBe(nowMonth - 1); // previous month
            expect(fromYear).toBe(nowYear); // this year
        }
    });

    test('should have precise timestamps', () => {
        const { fromDate, nowDate, from, to } = getDateRangeContext(lastMonth);
        const nowMonth = nowDate.getMonth();
        const fromMonth = fromDate.getMonth();
        const monthAfter = new Date(to + 1).getMonth();
        const monthBefore = new Date(from - 1).getMonth();

        expect(monthAfter).toBe(nowMonth);

        fromMonth === 0 ? expect(monthBefore).toBe(11) : expect(monthBefore).toBe(fromMonth - 1);
    });

    test('should have precise timestamps for timezone', () => {
        const range = getDateRangeContext(lastMonth);
        const { now: initialNow, timezone: initialTimezone } = range;

        const TIMEZONES = new Map([
            [
                'America/Toronto',
                [
                    asTimestamp(['Mar 1, 2022, 12:00 AM GMT-5', 'Mar 31, 2022, 23:59:59.999 GMT-4']),
                    asTimestamp(['Nov 1, 2023, 12:00 AM GMT-4', 'Nov 30, 2023, 23:59:59.999 GMT-5']),
                    asTimestamp(['Nov 1, 2023, 12:00 AM GMT-4', 'Nov 30, 2023, 23:59:59.999 GMT-5']),
                ],
            ],
            [
                'Asia/Tokyo',
                [
                    asTimestamp(['Mar 1, 2022, 12:00 AM GMT+9', 'Mar 31, 2022, 23:59:59.999 GMT+9']),
                    asTimestamp(['Dec 1, 2023, 12:00 AM GMT+9', 'Dec 31, 2023, 23:59:59.999 GMT+9']),
                    asTimestamp(['Dec 1, 2023, 12:00 AM GMT+9', 'Dec 31, 2023, 23:59:59.999 GMT+9']),
                ],
            ],
        ]);

        TIMEZONES.forEach((timestamps, timezone) => {
            range.timezone = timezone;

            TIMEZONE_TESTS_TIMESTAMPS.forEach((timestamp, index) => {
                const [fromTimestamp, toTimestamp] = timestamps[index]!;
                range.now = timestamp;
                expect(range.from).toBe(fromTimestamp);
                expect(range.to).toBe(toTimestamp);
            });

            // reset now and tz
            range.now = initialNow;
            range.timezone = initialTimezone;
        });
    });
});
