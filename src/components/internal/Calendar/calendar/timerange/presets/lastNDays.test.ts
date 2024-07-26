import { describe, expect, test, vi } from 'vitest';
import { getDateRangeContext, TIMEZONE_TESTS_TIMESTAMPS } from './testing/fixtures';
import { asTimestamp } from './testing/helpers';
import lastNDays, { DEFAULT_NUM_DAYS } from './lastNDays';

describe('last {n} days', () => {
    test('should use normalized (clamped) numberOfDays integer', () => {
        const ABOVE_MAX_VALUES = [10240, 720, 366];
        const BELOW_MIN_VALUES = [-5120, -256, -1, -0, 0];
        const DECIMAL_VALUES = [-3564.456, -37.3671, -1.5, 0.4775, 23.5783, 38858.343];
        const INVALID_VALUES = [NaN, Infinity, -Infinity, () => {}, {}, [43]];

        new Map([
            [ABOVE_MAX_VALUES, DEFAULT_NUM_DAYS],
            [BELOW_MIN_VALUES, DEFAULT_NUM_DAYS],
            [DECIMAL_VALUES, DEFAULT_NUM_DAYS],
            [INVALID_VALUES, DEFAULT_NUM_DAYS],
        ]).forEach((numberOfDays, values) => {
            values.forEach(N => {
                expect(getDateRangeContext(() => lastNDays(N as unknown as number)).numberOfDays).toBe(numberOfDays);
            });
        });
    });

    const lastNDaysTimestamps = getDateRangeContext(lastNDays);
    const numberOfDays = [/* default */ undefined, 3, 7, 10, 25, 100];

    test.each(numberOfDays)(`should be {N} days before now day (N => %i)`, numberOfDaysParam => {
        lastNDaysTimestamps.numberOfDays = numberOfDaysParam as number;

        const { numberOfDays, fromDate, now } = lastNDaysTimestamps;
        const date = new Date(fromDate);
        const withinLastNDays = vi.fn();

        while (date.getTime() <= now) {
            withinLastNDays();
            date.setDate(date.getDate() + 1);
        }

        expect(withinLastNDays).toHaveBeenCalledTimes(numberOfDays);
    });

    test.each(numberOfDays)(`should have precise timestamps (N => %i)`, numberOfDaysParam => {
        lastNDaysTimestamps.numberOfDays = numberOfDaysParam as number;

        const { from, fromDate, now, to } = lastNDaysTimestamps;
        const dateBefore = new Date(from - 1);

        expect(to).toBe(now);
        expect(dateBefore.getDay()).toBe((fromDate.getDay() + 6) % 7);
    });

    test('should have precise timestamps for timezone (N => 7)', () => {
        const range = getDateRangeContext(() => lastNDays(7));
        const { now: initialNow, timezone: initialTimezone } = range;

        const TIMEZONES = new Map([
            ['America/Toronto', asTimestamp(['Apr 9, 2022, 12:00 AM GMT-4', 'Dec 25, 2023, 12:00 AM GMT-5', 'Dec 25, 2023, 12:00 AM GMT-5'])],
            ['Asia/Tokyo', asTimestamp(['Apr 9, 2022, 12:00 AM GMT+9', 'Dec 26, 2023, 12:00 AM GMT+9', 'Dec 26, 2023, 12:00 AM GMT+9'])],
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
