// @vitest-environment jsdom
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { SYSTEM_TIMEZONE } from '@src/core/Localization/datetime/restamper';
import { DATES, startOfDay, TIMEZONES } from './testing/fixtures';
import today from '.';

describe('today', () => {
    const watchFn = vi.fn();

    beforeEach(() => {
        watchFn.mockRestore();
        vi.setSystemTime(0);
        today.timezone = SYSTEM_TIMEZONE;
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

    test('should have latest timestamp when internal watchable is idle', () => {
        DATES.forEach(date => {
            vi.setSystemTime(date);
            expect(today.timestamp).toBe(startOfDay()); // has latest timestamp
        });
    });

    test('should always recompute timestamp when timezone changes', () => {
        const testDates = (getStartDate: (index: number) => number) => {
            DATES.forEach((date, index) => {
                vi.setSystemTime(date);
                expect(today.timestamp).toBe(getStartDate(index)); // has latest timestamp
            });
        };

        expect(today.timezone).toBe(SYSTEM_TIMEZONE);
        testDates(() => startOfDay());

        TIMEZONES.forEach((startDates, timezone) => {
            today.timezone = timezone;
            expect(today.timezone).toBe(timezone);
            testDates(index => startDates[index]!.getTime());
        });

        // revert to system timezone
        today.timezone = SYSTEM_TIMEZONE;

        // and test again
        expect(today.timezone).toBe(SYSTEM_TIMEZONE);
        testDates(() => startOfDay());
    });

    test('should lazily recompute timestamp when internal watchable is not idle', () => {
        // register watch function
        const unwatch = today.watch(watchFn);

        let currentTimestamp = today.timestamp;
        let currentTimezone = today.timezone;
        let watchFnCalls = 0;

        expect(watchFn).toBeCalledTimes(++watchFnCalls);

        expect(watchFn).toHaveBeenLastCalledWith({
            timestamp: currentTimestamp,
            timezone: currentTimezone,
        });

        DATES.forEach(date => {
            vi.setSystemTime(date);
            expect(today.timestamp).not.toBe(startOfDay()); // timestamp not recomputed
            expect(today.timestamp).toBe(currentTimestamp); // timestamp not recomputed
            expect(watchFn).toBeCalledTimes(watchFnCalls); // not called

            vi.setSystemTime(date.setHours(23, 59, 59)); // last second of current day
            vi.advanceTimersToNextTimer(); // triggers the current 1-second timer
            vi.advanceTimersToNextTimer(); // triggers the next 1-second timer (already in next day)

            currentTimestamp = startOfDay(); // start of next day

            expect(today.timestamp).toBe(currentTimestamp); // timestamp recomputed (next day)
            expect(watchFn).toBeCalledTimes(++watchFnCalls); // will be called (next day)

            expect(watchFn).toHaveBeenLastCalledWith({
                timestamp: currentTimestamp,
                timezone: currentTimezone,
            });
        });

        // unregister watch function
        unwatch();

        DATES.forEach(date => {
            vi.setSystemTime(date);
            const startTimestamp = startOfDay();

            expect(today.timestamp).toBe(startTimestamp); // has latest timestamp
            expect(watchFn).toBeCalledTimes(watchFnCalls); // not called

            vi.setSystemTime(date.setHours(23, 59, 59)); // last second of current day
            vi.advanceTimersToNextTimer(); // no timer is triggered (since there is no watcher)
            vi.advanceTimersToNextTimer(); // no timer is triggered (since there is no watcher)

            expect(today.timestamp).toBe(startTimestamp); // same timestamp
            expect(watchFn).toBeCalledTimes(watchFnCalls); // not called

            vi.advanceTimersByTime(1000); // the next 1-second (already in next day)

            expect(today.timestamp).toBe(startOfDay()); // has latest timestamp
            expect(today.timestamp).not.toBe(startTimestamp); // no longer in previous day
            expect(watchFn).toBeCalledTimes(watchFnCalls); // not called
        });
    });
});
