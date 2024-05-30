// @vitest-environment jsdom
import { describe, expect, test, vi } from 'vitest';
import { setupTimers } from '../__testing__/fixtures';
import { createInterval } from './main';

describe('createInterval', () => {
    setupTimers();

    test('should run callback at intervals (close to the specified ms)', () => {
        const INTERVAL_MS = 500;
        const ADVANCE_TIME_MS = 10550;
        const ADVANCE_TIME_ELAPSED_SECONDS = Math.floor(ADVANCE_TIME_MS / INTERVAL_MS);

        const intervals: number[] = [];
        const intervalCallback = vi.fn(() => intervals.push(Date.now()));
        const interval = createInterval(intervalCallback, INTERVAL_MS);

        vi.advanceTimersByTime(ADVANCE_TIME_MS);
        expect(intervalCallback).toBeCalledTimes(ADVANCE_TIME_ELAPSED_SECONDS);

        for (let i = intervals.length - 1; i >= 1; ) {
            expect(intervals[i]! - intervals[--i]!).toBeCloseTo(INTERVAL_MS, -2);
        }

        interval.cancel(); // cancel interval
    });

    test('should abort interval when cancel is called', () => {
        let advanceTime: number;
        let advanceTimeMs = 0;
        let advanceTimeElapsedSeconds: number;

        const INTERVAL_MS = 1000;
        const intervalCallback = vi.fn();
        const interval = createInterval(intervalCallback, INTERVAL_MS);

        expect(interval.signal.aborted).toBe(false);

        vi.advanceTimersByTime((advanceTime = 5500));

        advanceTimeElapsedSeconds = Math.floor((advanceTimeMs += advanceTime) / INTERVAL_MS);
        expect(intervalCallback).toBeCalledTimes(advanceTimeElapsedSeconds);

        vi.advanceTimersByTime((advanceTime = 5000));

        advanceTimeElapsedSeconds = Math.floor((advanceTimeMs + advanceTime) / INTERVAL_MS);
        expect(intervalCallback).toBeCalledTimes(advanceTimeElapsedSeconds);

        interval.cancel();
        expect(interval.signal.aborted).toBe(true);

        vi.advanceTimersByTime(advanceTime);
        expect(intervalCallback).toBeCalledTimes(advanceTimeElapsedSeconds);
    });
});
