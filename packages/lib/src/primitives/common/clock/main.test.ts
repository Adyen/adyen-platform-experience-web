// @vitest-environment jsdom
import { describe, expect, test, vi } from 'vitest';
import clock from './main';

describe('clock', () => {
    test('should call subscription callbacks with now timestamp every second (approximately)', () => {
        vi.useFakeTimers();
        vi.runOnlyPendingTimers();

        const SLEEP_DURATIONS_MS = [100, 150, 250, 350, 450, 500, 600, 650, 750, 850, 900, 1050, 1200, 1250, 1500];
        const watchFn = vi.fn(({ now }) => vi.setSystemTime(now));
        const unsubscribe = clock.subscribe(watchFn);

        expect(watchFn).toBeCalledTimes(1); // will be called
        expect(watchFn.mock.lastCall![0].now).toBe(Date.now());

        SLEEP_DURATIONS_MS.forEach(vi.advanceTimersByTime);

        const watchFnCalls = watchFn.mock.calls;

        for (let i = watchFnCalls.length - 1; i >= 1; i--) {
            const interval = watchFnCalls[i]![0].now - watchFnCalls[i - 1]![0].now;
            expect(interval).toBeCloseTo(1000, -2);
        }

        unsubscribe(); // unregister watch function

        SLEEP_DURATIONS_MS.forEach(vi.advanceTimersByTime);

        expect(watchFn.mock.calls.length).toEqual(watchFnCalls.length); // no calls after unsubscribe

        vi.useRealTimers();
    });
});
