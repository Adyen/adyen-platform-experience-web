import { describe, expect, test, vi } from 'vitest';
import { getDateRangeContext } from './shared/test-utils';
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

    const runTestsFor = (_numberOfDays?: number) => {
        const which = _numberOfDays ?? DEFAULT_NUM_DAYS;

        test(`should be {N} days before now day (N => ${which})`, () => {
            const { numberOfDays, fromDate, now } = lastNDaysTimestamps;
            const date = new Date(fromDate);
            const withinLastNDays = vi.fn();

            while (date.getTime() <= now) {
                withinLastNDays();
                date.setDate(date.getDate() + 1);
            }

            expect(withinLastNDays).toHaveBeenCalledTimes(numberOfDays);
        });

        test(`should have precise timestamps (N => ${which})`, () => {
            const { from, fromDate, now, to } = lastNDaysTimestamps;
            const dateBefore = new Date(from - 1);

            expect(to).toBe(now);
            expect(dateBefore.getDay()).toBe((fromDate.getDay() + 6) % 7);
        });
    };

    // test with initial default `numberOfDays`
    runTestsFor();

    // test with some valid `numberOfDays` values
    [3, 7, 10, 25, 100].forEach(numberOfDays => {
        lastNDaysTimestamps.numberOfDays = numberOfDays;
        runTestsFor(lastNDaysTimestamps.numberOfDays);
    });
});
