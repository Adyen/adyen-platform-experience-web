// @vitest-environment jsdom
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { SYSTEM_TIMEZONE } from '@src/core/Localization/datetime/restamper';
import { DATES, startOfDay, startOfNextDay, TIMEZONES } from './testing/fixtures';
import $today from './today';

describe('today', () => {
    const watchFn = vi.fn();

    beforeEach(() => {
        watchFn.mockRestore();
        vi.setSystemTime(0);
    });

    beforeAll(() => {
        vi.useFakeTimers();
        vi.stubGlobal(
            'document',
            Object.assign({}, document, {
                timeline: { currentTime: undefined },
            })
        );
    });

    afterAll(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    test('should always recompute timestamp when internal watchable is idle and/or timezone changes', () => {
        let today = $today();

        const testDates = (getStartDate: (index: number) => number) => {
            DATES.forEach((date, index) => {
                vi.setSystemTime(date);

                const currentTimestamp = getStartDate(index); // start of current day
                const nextTimestamp = startOfNextDay(currentTimestamp); // start of next day
                expect(today.timestamp).toBe(currentTimestamp); // same day (same timestamp)

                vi.setSystemTime(nextTimestamp - 1); // 1ms away from start of next day
                expect(today.timestamp).toBe(currentTimestamp); // same day (same timestamp)

                vi.setSystemTime(nextTimestamp); // start of next day
                expect(today.timestamp).not.toBe(currentTimestamp); // next day (different timestamp)
                expect(today.timestamp).toBe(nextTimestamp); // next day (next timestamp)

                vi.setSystemTime(startOfNextDay(nextTimestamp) - 1); // end of next day
                expect(today.timestamp).toBe(nextTimestamp); // same day (same timestamp)
            });
        };

        expect(today.timezone).toBe(SYSTEM_TIMEZONE);
        testDates(() => startOfDay());

        TIMEZONES.forEach((startDates, timezone) => {
            today = $today(timezone);
            expect(today.timezone).toBe(timezone);
            testDates(index => startDates[index]!.getTime());
        });

        // revert to system timezone
        today = $today();

        // and test again
        expect(today.timezone).toBe(SYSTEM_TIMEZONE);
        testDates(() => startOfDay());
    });
});
