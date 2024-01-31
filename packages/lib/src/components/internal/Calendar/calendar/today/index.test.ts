// @vitest-environment jsdom
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import today from '.';

describe('today', () => {
    const DATES = [new Date('Apr 15, 2022, 1:30 PM GMT'), new Date('Dec 31, 2023, 5:30 PM GMT'), new Date('Jan 1, 2024, 3:30 AM GMT')];
    const startOfDay = (date = new Date()) => date.setHours(0, 0, 0, 0);
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
                timeline: {
                    get currentTime() {
                        return performance.now();
                    },
                },
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

        expect(watchFn).toBeCalledTimes(1);
        expect(watchFn).toHaveBeenLastCalledWith({});

        DATES.forEach(date => {
            vi.setSystemTime(date);
            expect(today.timestamp).not.toBe(startOfDay()); // timestamp not recomputed
            expect(today.timestamp).toBe(currentTimestamp); // timestamp not recomputed
        });

        // unregister watch function
        unwatch();

        DATES.forEach(date => {
            vi.setSystemTime(date);
            expect(today.timestamp).toBe(startOfDay()); // has latest timestamp
        });
    });
});
