// @vitest-environment jsdom
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import today from '.';

describe('today', () => {
    const startOfDay = (date = new Date()) => date.setHours(0, 0, 0, 0);
    const watchFn = vi.fn();

    const DATES = [
        new Date('Feb 28, 2000, 11:30 PM GMT'),
        new Date('Apr 15, 2022, 1:30 PM GMT'),
        new Date('Dec 31, 2023, 5:30 PM GMT'),
        new Date('Jan 1, 2024, 3:30 AM GMT'),
    ];

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

    test('should have latest timestamp when internal watchable is idle', () => {
        DATES.forEach(date => {
            vi.setSystemTime(date);
            expect(today.timestamp).toBe(startOfDay()); // has latest timestamp
        });
    });

    test('should lazily recompute timestamp when internal watchable is not idle', () => {
        // register watch function
        const unwatch = today.watch(watchFn);
        let currentTimestamp = today.timestamp;
        let watchFnCalls = 0;

        expect(watchFn).toBeCalledTimes(++watchFnCalls);
        expect(watchFn).toHaveBeenLastCalledWith({ timestamp: currentTimestamp });

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
            expect(watchFn).toHaveBeenLastCalledWith({ timestamp: currentTimestamp });
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
