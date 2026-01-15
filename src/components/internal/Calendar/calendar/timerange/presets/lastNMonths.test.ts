import { describe, expect, test, vi } from 'vitest';
import { getDateRangeContext, TIMEZONE_TESTS_TIMESTAMPS } from './testing/fixtures';
import { asTimestamp } from './testing/helpers';
import lastNMonths, { DEFAULT_NUM_MONTHS } from './lastNMonths';

describe('last {n} months', () => {
    test('should use normalized (clamped) numberOfMonths integer', () => {
        const ABOVE_MAX_VALUES = [15, 20, 13];
        const BELOW_MIN_VALUES = [-12, -5, -1, -0, 0];
        const DECIMAL_VALUES = [-13.456, -4.3671, -1.5, 0.4775, 7.5783, 38.343];
        const INVALID_VALUES = [NaN, Infinity, -Infinity, () => {}, {}, [43]];

        new Map([
            [ABOVE_MAX_VALUES, DEFAULT_NUM_MONTHS],
            [BELOW_MIN_VALUES, DEFAULT_NUM_MONTHS],
            [DECIMAL_VALUES, DEFAULT_NUM_MONTHS],
            [INVALID_VALUES, DEFAULT_NUM_MONTHS],
        ]).forEach((numberOfMonths, values) => {
            values.forEach(N => {
                expect(getDateRangeContext(() => lastNMonths(N as unknown as number)).numberOfMonths).toBe(numberOfMonths);
            });
        });
    });

    const lastNMonthsTimestamps = getDateRangeContext(lastNMonths);
    const numberOfMonths = [/* default */ undefined, 3, 6, 10];

    test.each(numberOfMonths)(`should be {N} months before now month (N => %i)`, numberOfMonthsParam => {
        lastNMonthsTimestamps.numberOfMonths = numberOfMonthsParam as number;

        const { numberOfMonths, fromDate, now } = lastNMonthsTimestamps;
        const date = new Date(fromDate);
        const withinLastNMonths = vi.fn();

        while (date.getTime() <= now) {
            withinLastNMonths();
            date.setMonth(date.getMonth() + 1);
        }

        expect(withinLastNMonths).toHaveBeenCalledTimes(numberOfMonths);
    });

    test.each(numberOfMonths)(`should have precise timestamps (N => %i)`, numberOfMonthsParam => {
        lastNMonthsTimestamps.numberOfMonths = numberOfMonthsParam as number;

        const { from, fromDate, now, to } = lastNMonthsTimestamps;
        const dateBefore = new Date(from - 1);

        expect(to).toBe(now);
        expect(dateBefore.getDay()).toBe((fromDate.getDay() + 6) % 7);
    });

    test('should have precise timestamps for timezone (N => 10)', () => {
        const range = getDateRangeContext(() => lastNMonths(10));
        const { now: initialNow, timezone: initialTimezone } = range;

        const TIMEZONES = new Map([
            ['America/Toronto', asTimestamp(['Jul 1, 2021, 12:00 AM GMT-4', 'Mar 1, 2023, 12:00 AM GMT-5', 'Mar 1, 2023, 12:00 AM GMT-5'])],
            ['Asia/Tokyo', asTimestamp(['Jul 1, 2021, 12:00 AM GMT+9', 'Apr 1, 2023, 12:00 AM GMT+9', 'Apr 1, 2023, 12:00 AM GMT+9'])],
        ]);

        TIMEZONES.forEach((timestamps, timezone) => {
            range.timezone = timezone;

            TIMEZONE_TESTS_TIMESTAMPS.forEach((timestamp, index) => {
                range.now = timestamp;
                expect(range.from).toBe(timestamps[index]!);
                expect(range.to).toBe(timestamp);
            });

            // reset now and tz
            range.now = initialNow;
            range.timezone = initialTimezone;
        });
    });
});
