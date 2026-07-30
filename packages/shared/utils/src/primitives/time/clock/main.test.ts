// @vitest-environment jsdom
import { describe, expect, test, vi } from 'vitest';
import { setupTimers } from '../__testing__/fixtures';
import { clock } from './main';

describe('clock', () => {
    setupTimers();

    test('should call subscription callbacks with now timestamp every second (approximately)', () => {
        const INTERVAL_MS = 1000; // 1 second
        const ADVANCE_TIME_MS = 10550;
        const ADVANCE_TIME_ELAPSED_SECONDS = Math.floor(ADVANCE_TIME_MS / INTERVAL_MS);

        const watchFn = vi.fn(({ now }) => vi.setSystemTime(now));
        const watchFnCalls = watchFn.mock.calls;
        const unsubscribe = clock.subscribe(watchFn);

        let watchFnCallsCount = 0;

        expect(watchFn).toBeCalledTimes(++watchFnCallsCount); // will be called
        expect(watchFn).toHaveBeenLastCalledWith({ now: Date.now() });

        vi.advanceTimersByTime(ADVANCE_TIME_MS);
        expect(watchFn).toBeCalledTimes((watchFnCallsCount += ADVANCE_TIME_ELAPSED_SECONDS));

        for (let i = watchFnCalls.length - 1; i >= 1; ) {
            const interval = watchFnCalls[i]![0].now - watchFnCalls[--i]![0].now;
            expect(interval).toBeCloseTo(INTERVAL_MS, -2);
        }

        unsubscribe(); // unregister watch function

        vi.advanceTimersByTime(ADVANCE_TIME_MS);
        expect(watchFn).toBeCalledTimes(watchFnCallsCount); // no calls after unsubscribe
    });
});
