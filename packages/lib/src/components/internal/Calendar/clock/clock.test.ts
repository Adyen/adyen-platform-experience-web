// @vitest-environment jsdom
import { describe, expect, test, vi } from 'vitest';
import { DATES, initialize } from './testing/fixtures';
import clock from './clock';

describe('clock', () => {
    const { watchFn } = initialize();

    test('should have latest timestamp when not being watched', () => {
        DATES.forEach(date => {
            vi.setSystemTime(date);
            expect(clock.timestamp).toBe(Date.now()); // now timestamp
        });
    });

    test('should use latest timestamp at timed intervals when being watched', () => {
        const unwatch = clock.watch(watchFn);
        let currentTimestamp = Date.now();
        let watchFnCalls = 0;

        expect(clock.timestamp).toBe(currentTimestamp); // latest timestamp
        expect(watchFn).toBeCalledTimes(++watchFnCalls); // will be called
        expect(watchFn).toHaveBeenLastCalledWith({ timestamp: currentTimestamp });

        DATES.forEach(date => {
            vi.runOnlyPendingTimers(); // trigger pending timers
            vi.setSystemTime(date);

            expect(clock.timestamp).not.toBe(Date.now()); // timestamp not recomputed
            expect(clock.timestamp).toBe(currentTimestamp); // timestamp not recomputed
            expect(watchFn).toBeCalledTimes(watchFnCalls); // not called

            vi.advanceTimersToNextTimer(); // trigger clock timer
            currentTimestamp = Date.now();

            expect(clock.timestamp).toBe(currentTimestamp); // timestamp recomputed
            expect(watchFn).toBeCalledTimes(++watchFnCalls); // will be called
            expect(watchFn).toHaveBeenLastCalledWith({ timestamp: currentTimestamp });
        });

        unwatch(); // unregister watch function

        DATES.forEach(date => {
            vi.runOnlyPendingTimers(); // trigger pending timers
            vi.setSystemTime(date);

            expect(clock.timestamp).toBe((currentTimestamp = Date.now())); // latest timestamp
            expect(watchFn).toBeCalledTimes(watchFnCalls); // not called

            vi.advanceTimersToNextTimer(); // no clock timer (since there are no watchers)
            currentTimestamp = Date.now();

            expect(clock.timestamp).toBe(currentTimestamp); // same timestamp
            expect(watchFn).toBeCalledTimes(watchFnCalls); // not called
        });
    });
});
