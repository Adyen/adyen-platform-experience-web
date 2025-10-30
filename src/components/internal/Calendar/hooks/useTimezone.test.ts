/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/preact';
import { afterEach, beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import useTimezone, { getTimezoneTime, getUsedTimezone } from './useTimezone';
import clock from '../../../../primitives/time/clock';

// Mock clock module to enable spying on subscriptions and unsubscriptions
vi.mock(import('../../../../primitives/time/clock'), async importOriginal => {
    const mod = await importOriginal();
    const originalClock = mod.default;
    const originalSubscribe = originalClock.subscribe;

    const clock = {
        ...originalClock,
        subscribe: vi.fn<typeof originalSubscribe>((...args) => {
            const originalUnsubscribe = originalSubscribe(...args);
            const unsubscribe = vi.fn(originalUnsubscribe);
            clockUnsubscribes.push(unsubscribe);
            return unsubscribe;
        }),
    };

    return { ...mod, clock, default: clock };
});

const clockUnsubscribes = [] as Mock<() => void>[];
const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const validTimezones = [
    { timezone: 'Europe/London', time: '04:10 PM', offset: '' },
    { timezone: 'America/New_York', time: '11:10 AM', offset: '-5' },
    { timezone: 'Asia/Tokyo', time: '01:10 AM', offset: '+9' },
    { timezone: 'Australia/Sydney', time: '03:10 AM', offset: '+11' },
    { timezone: 'UTC', time: '04:10 PM', offset: '' },
];

describe('useTimezone', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(1703520645123); // Dec 25, 2023, 4:10:45.123 PM UTC
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        clockUnsubscribes.length = 0;
    });

    describe('getTimezoneTime', () => {
        test('should handle valid IANA timezones correctly', () => {
            validTimezones.forEach(({ timezone, time, offset }) => {
                expect(getTimezoneTime(timezone, Date.now())).toEqual([time, offset]);
            });
        });

        test('should fallback to system timezone for invalid timezones', () => {
            const currentTimestamp = Date.now();
            const result1 = getTimezoneTime(systemTimezone, currentTimestamp);
            const result2 = getTimezoneTime('Invalid/Timezone', currentTimestamp);
            expect(result1).toEqual(result2);
        });

        test('should handle timezone with DST correctly', () => {
            const timezone = 'America/New_York';
            const winterTimestamp = new Date('2023-01-15T12:00:00Z').getTime();
            const summerTimestamp = new Date('2023-07-15T12:00:00Z').getTime();

            expect(getTimezoneTime(timezone, winterTimestamp)).toEqual(['07:00 AM', '-5']); // Winter: 7:00 AM EST (UTC-5)
            expect(getTimezoneTime(timezone, summerTimestamp)).toEqual(['08:00 AM', '-4']); // Summer: 8:00 AM EDT (UTC-4)
        });

        test('should return consistent results for same inputs', () => {
            const timezone = 'America/New_York';
            const currentTimestamp = Date.now();
            const result1 = getTimezoneTime(timezone, currentTimestamp);
            const result2 = getTimezoneTime(timezone, currentTimestamp);
            expect(result1).toEqual(result2);
        });

        test('should handle extreme timestamp values', () => {
            expect(getTimezoneTime('UTC', 0)).toEqual(['12:00 AM', '']); // Jan 1, 1970, 12:00:00 UTC
            expect(getTimezoneTime('UTC', 1000000000000)).toEqual(['01:46 AM', '']); // Sep 9, 2001, 01:46:40 UTC
            expect(getTimezoneTime('UTC', 1900000000000)).toEqual(['05:46 PM', '']); // Mar 17, 2030 17:46:40 UTC
        });

        test('should use Date.now() when no timestamp is provided', () => {
            validTimezones.forEach(({ timezone, time, offset }) => {
                expect(getTimezoneTime(timezone)).toEqual([time, offset]);
            });
        });
    });

    describe('getUsedTimezone', () => {
        test('should return resolved timezone for valid IANA timezones', () => {
            validTimezones.forEach(({ timezone }) => {
                expect(getUsedTimezone(timezone)).toBe(timezone);
            });
        });

        test('should return system timezone when no timezone is provided', () => {
            expect(getUsedTimezone()).toBe(systemTimezone);
        });

        test('should return system timezone when undefined or invalid timezone is provided', () => {
            const invalidTimezones = ['Invalid/Timezone', undefined];
            invalidTimezones.forEach(timezone => {
                expect(getUsedTimezone(timezone)).toBe(systemTimezone);
            });
        });
    });

    describe('useTimezone hook', () => {
        test('should return basic timezone information with default config', () => {
            const { result } = renderHook(() => useTimezone());
            expect(result.current.timestamp).toBe(Date.now());
            expect(result.current.timezone).toBe(systemTimezone);
        });

        test('should handle empty config object', () => {
            const { result: defaultResult } = renderHook(() => useTimezone());
            const { result } = renderHook(() => useTimezone({}));
            expect(result.current).toEqual(defaultResult.current); // Should behave the same as default config
        });

        test('should return correct time and offset for valid timezones', () => {
            const currentTimestamp = Date.now();

            validTimezones.forEach(({ timezone, time, offset }) => {
                const { result } = renderHook(() => useTimezone({ timezone }));
                expect(result.current.timezone).toBe(timezone);
                expect(result.current.timestamp).toBe(currentTimestamp);
                expect(result.current.clockTime).toBe(time);
                expect(result.current.GMTOffset).toBe(offset);
            });
        });

        test('should update when timezone config changes', () => {
            const currentTimestamp = Date.now();
            const { result, rerender } = renderHook((props?: { timezone?: string }) => useTimezone(props));

            expect(result.current.timestamp).toBe(currentTimestamp);
            expect(result.current.timezone).toBe(systemTimezone);

            validTimezones.forEach(({ timezone, time, offset }) => {
                rerender({ timezone });
                expect(result.current.timezone).toBe(timezone);
                expect(result.current.timestamp).toBe(currentTimestamp);
                expect(result.current.clockTime).toBe(time);
                expect(result.current.GMTOffset).toBe(offset);
            });
        });

        test('should not subscribe to clock updates by default', async () => {
            const { result } = renderHook(() => useTimezone());
            const initialTimestamp = result.current.timestamp;
            expect(initialTimestamp).toBe(Date.now());

            // Advance time but timestamp shouldn't change without clock subscription
            await vi.advanceTimersByTimeAsync(5000);

            // Should still be the same timestamp since withClock is false by default
            expect(result.current.timestamp).toBe(initialTimestamp);
        });

        test('should handle withClock configuration', async () => {
            const { result, unmount } = renderHook(() => useTimezone({ withClock: true }));
            const unsubscribe = clockUnsubscribes.at(-1)!;
            const initialTimestamp = result.current.timestamp;

            expect(initialTimestamp).toBe(Date.now());
            expect(clock.subscribe).toHaveBeenCalledOnce();
            expect(unsubscribe).not.toHaveBeenCalled();

            // Advance time — timestamp should change
            await vi.advanceTimersByTimeAsync(5000);

            expect(result.current.timestamp).not.toBe(initialTimestamp);
            expect(unsubscribe).not.toHaveBeenCalled();

            // Unmount the hook
            unmount();

            // Clock subscription should be cleaned up
            expect(unsubscribe).toHaveBeenCalledOnce();
        });
    });
});
