// @vitest-environment jsdom
import { describe, expect, test, vi } from 'vitest';
import { SYSTEM_TIMEZONE } from '../../../../core/Localization/datetime/restamper';
import { DATES, initialize, startOfDay, startOfNextDay, TIMEZONES } from './testing/fixtures';
import $today from './today';

describe('today', () => {
    const { watchFn } = initialize();

    test('should use shared instance for same timezone', () => {
        const testRoutine = (timezone?: string) => {
            const today1 = $today(timezone);
            const today2 = $today(timezone);

            expect(today1).toBe(today2);
            expect(today1.timestamp).toBe(today2.timestamp);
            expect(today1.timezone).toBe(today2.timezone);
        };

        testRoutine();
        testRoutine(SYSTEM_TIMEZONE);
        testRoutine('Unknown/Invalid_TZ'); // invalid timezone

        TIMEZONES.forEach((_, timezone) => testRoutine(timezone));
    });

    test('should have latest timestamp when not being watched', () => {
        const testRoutine = (getStartDate: (index: number) => number, timezone?: string) => {
            const today = $today(timezone);

            expect(today.timezone).toBe(timezone ?? SYSTEM_TIMEZONE);

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

        testRoutine(() => startOfDay(), SYSTEM_TIMEZONE); // explicit system timezone

        TIMEZONES.forEach((startDates, timezone) => {
            testRoutine(index => startDates[index]!.getTime(), timezone);
        });

        testRoutine(() => startOfDay()); // implicit (defaults to) system timezone
    });

    test('should use latest timestamp for new day when being watched', () => {
        let watchFnCalls = 0;

        const testRoutine = (getStartDate: (index: number) => number, timezone?: string) => {
            vi.setSystemTime(0);

            const today = $today(timezone);
            const unwatch = today.watch(watchFn);
            let currentDayTimestamp = watchFn.mock.lastCall[0]?.timestamp as number;

            expect(today.timestamp).toBe(currentDayTimestamp);
            expect(today.timezone).toBe(timezone ?? SYSTEM_TIMEZONE);
            expect(watchFn).toBeCalledTimes(++watchFnCalls); // will be called
            expect(watchFn).toHaveBeenLastCalledWith({ timestamp: currentDayTimestamp });

            DATES.forEach((date, index) => {
                vi.runOnlyPendingTimers(); // trigger pending timers
                vi.setSystemTime(date);

                const todayTimestamp = getStartDate(index); // start of current day
                const nextTimestamp = startOfNextDay(todayTimestamp); // start of next day

                expect(today.timestamp).not.toBe(todayTimestamp); // timestamp not recomputed
                expect(today.timestamp).toBe(currentDayTimestamp); // timestamp not recomputed
                expect(watchFn).toBeCalledTimes(watchFnCalls); // not called

                vi.advanceTimersToNextTimer(); // trigger clock timer
                currentDayTimestamp = todayTimestamp;

                expect(today.timestamp).toBe(currentDayTimestamp); // timestamp recomputed
                expect(watchFn).toBeCalledTimes(++watchFnCalls); // will be called
                expect(watchFn).toHaveBeenLastCalledWith({ timestamp: currentDayTimestamp });

                vi.setSystemTime(nextTimestamp - 1); // 1ms away from start of next day
                vi.advanceTimersToNextTimer(); // trigger clock timer

                expect(today.timestamp).toBe(currentDayTimestamp); // same day (same timestamp)
                expect(watchFn).toBeCalledTimes(watchFnCalls); // not called

                vi.setSystemTime(nextTimestamp); // start of next day
                vi.advanceTimersToNextTimer(); // trigger clock timer

                expect(today.timestamp).not.toBe(currentDayTimestamp); // next day (different timestamp)
                expect(today.timestamp).toBe((currentDayTimestamp = nextTimestamp)); // next day (next timestamp)
                expect(watchFn).toBeCalledTimes(++watchFnCalls); // will be called
                expect(watchFn).toHaveBeenLastCalledWith({ timestamp: currentDayTimestamp });

                vi.setSystemTime(startOfNextDay(nextTimestamp) - 1); // end of next day
                vi.advanceTimersToNextTimer(); // trigger clock timer

                expect(today.timestamp).toBe(nextTimestamp); // same day (same timestamp)
                expect(watchFn).toBeCalledTimes(watchFnCalls); // not called

                vi.setSystemTime((currentDayTimestamp = Date.now()));
                vi.advanceTimersToNextTimer(); // trigger clock timer
                expect(watchFn).toBeCalledTimes(++watchFnCalls); // will be called
                expect(watchFn).toHaveBeenLastCalledWith({ timestamp: currentDayTimestamp });
            });

            unwatch(); // unregister watch function;
        };

        testRoutine(() => startOfDay(), SYSTEM_TIMEZONE); // explicit system timezone

        TIMEZONES.forEach((startDates, timezone) => {
            testRoutine(index => startDates[index]!.getTime(), timezone);
        });

        testRoutine(() => startOfDay()); // implicit (defaults to) system timezone
    });
});
