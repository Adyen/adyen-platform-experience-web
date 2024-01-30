import { describe, expect, test, vi } from 'vitest';
import { getDateRangeContext, TIMEZONE_TESTS_TIMESTAMPS } from './testing/fixtures';
import { asTimestamp } from './testing/helpers';
import type { WeekDay } from '../../types';
import thisWeek from './thisWeek';

describe('this week', () => {
    const thisWeekTimestamps = getDateRangeContext(thisWeek);

    const runTestsFor = (firstWeekDay?: WeekDay) => {
        const which = firstWeekDay === undefined ? 'default' : `${firstWeekDay}`;

        test(`should be this week (firstWeekDay => ${which})`, () => {
            const { firstWeekDay, fromDate, nowDate, to, toDate } = thisWeekTimestamps;
            const fromMonth = fromDate.getMonth();
            const fromYear = fromDate.getFullYear();
            const nowMonth = nowDate.getMonth();
            const nowYear = nowDate.getFullYear();
            const toMonth = toDate.getMonth();
            const toYear = toDate.getFullYear();
            const dateOfToday = nowDate.getDate();
            const firstDayOfThisWeek = fromDate.getDate();

            expect(fromDate.getDay()).toBe(firstWeekDay); // first week day
            expect(toDate.getDay()).toBe(nowDate.getDay()); // today

            if (firstDayOfThisWeek <= dateOfToday) {
                expect(fromMonth).toBe(toMonth); // same month
                expect(fromYear).toBe(toYear); // same year
                expect(fromMonth).toBe(nowMonth); // current month
                expect(fromYear).toBe(nowYear); // current year
            } else {
                if (nowMonth === 0) {
                    expect(fromMonth).toBe(11); // last month of year
                    expect(fromYear).toBe(nowYear - 1); // previous year
                } else {
                    expect(fromMonth).toBe(nowMonth - 1); // previous month
                    expect(fromYear).toBe(nowYear); // this year
                }

                expect(fromMonth).toBe(toMonth); // same month
                expect(fromYear).toBe(toYear); // same year
            }

            const date = new Date(fromDate);
            const nowDateStartTimestamp = new Date(nowDate).setHours(0, 0, 0, 0);
            const daysInWeek = (7 + ((nowDate.getDay() - firstWeekDay) % 7)) % 7;
            const dayInThisWeek = vi.fn();
            const daySinceThisWeek = vi.fn();

            let timestamp = date.getTime();

            while (timestamp < nowDateStartTimestamp) {
                daySinceThisWeek();
                if (timestamp < to) dayInThisWeek();
                timestamp = date.setDate(date.getDate() + 1);
            }

            expect(dayInThisWeek).toHaveBeenCalledTimes(daysInWeek);
            expect(daySinceThisWeek.mock.calls.length).toBeGreaterThanOrEqual(daysInWeek);
        });

        test(`should have precise timestamps (firstWeekDay => ${which})`, () => {
            const { firstWeekDay, from, now, to } = thisWeekTimestamps;
            const dateBefore = new Date(from - 1);

            expect(to).toBe(now);
            expect(dateBefore.getDay()).toBe(((firstWeekDay as number) + 6) % 7);
        });
    };

    // test with default `firstWeekDay`
    runTestsFor();

    // test with all possible values for `firstWeekDay`
    for (let i = 0; i < 7; i++) {
        thisWeekTimestamps.firstWeekDay = i as WeekDay;
        runTestsFor(thisWeekTimestamps.firstWeekDay);
    }

    test('should have precise timestamps for timezone (firstWeekDay => 1)', () => {
        const range = getDateRangeContext(() => thisWeek(1));
        const { now: initialNow, timezone: initialTimezone } = range;

        const TIMEZONES = new Map([
            ['America/Toronto', asTimestamp(['Apr 11, 2022, 12:00 AM GMT-4', 'Dec 25, 2023, 12:00 AM GMT-5', 'Dec 25, 2023, 12:00 AM GMT-5'])],
            ['Asia/Tokyo', asTimestamp(['Apr 11, 2022, 12:00 AM GMT+9', 'Jan 1, 2024, 12:00 AM GMT+9', 'Jan 1, 2024, 12:00 AM GMT+9'])],
        ]);

        TIMEZONES.forEach((timestamps, timezone) => {
            range.timezone = timezone;

            TIMEZONE_TESTS_TIMESTAMPS.forEach((timestamp, index) => {
                range.now = timestamp;
                expect(range.from).toBe(timestamps[index]!);
                expect(range.to).toBe(timestamp);
            });

            // reset now and tz
            range.now = initialNow;
            range.timezone = initialTimezone;
        });
    });
});
