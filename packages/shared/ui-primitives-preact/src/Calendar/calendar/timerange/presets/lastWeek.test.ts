import { describe, expect, test, vi } from 'vitest';
import { getDateRangeContext, TIMEZONE_TESTS_TIMESTAMPS } from './testing/fixtures';
import { asTimestamp } from './testing/helpers';
import type { WeekDay } from '../../types';
import lastWeek from './lastWeek';

describe('last week', () => {
    const lastWeekTimestamps = getDateRangeContext(lastWeek);
    const firstWeekDays = [/* default */ undefined, 0, 1, 2, 3, 4, 5, 6];

    test.each(firstWeekDays)(`should be previous week (firstWeekDay => %i)`, firstWeekDayParam => {
        lastWeekTimestamps.firstWeekDay = firstWeekDayParam as WeekDay;

        const { firstWeekDay, fromDate, nowDate, to, toDate } = lastWeekTimestamps;
        const fromMonth = fromDate.getMonth();
        const fromYear = fromDate.getFullYear();
        const nowMonth = nowDate.getMonth();
        const nowYear = nowDate.getFullYear();
        const toMonth = toDate.getMonth();
        const toYear = toDate.getFullYear();
        const dateOfToday = nowDate.getDate();
        const firstDayOfLastWeek = fromDate.getDate();
        const lastDayOfLastWeek = toDate.getDate();

        expect(fromDate.getDay()).toBe(firstWeekDay); // first week day
        expect(toDate.getDay()).toBe(((firstWeekDay as number) + 6) % 7); // last week day

        if (firstDayOfLastWeek < dateOfToday) {
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

            if (lastDayOfLastWeek < dateOfToday) {
                expect(nowMonth).toBe(toMonth); // current month
                expect(nowYear).toBe(toYear); // current year
            } else {
                expect(fromMonth).toBe(toMonth); // same month
                expect(fromYear).toBe(toYear); // same year
            }
        }

        const date = new Date(fromDate);
        const nowDateStartTimestamp = new Date(nowDate).setHours(0, 0, 0, 0);
        const dayInLastWeek = vi.fn();
        const daySinceLastWeek = vi.fn();

        let timestamp = date.getTime();

        while (timestamp < nowDateStartTimestamp) {
            daySinceLastWeek();
            if (timestamp < to) dayInLastWeek();
            timestamp = date.setDate(date.getDate() + 1);
        }

        expect(dayInLastWeek).toHaveBeenCalledTimes(7);
        expect(daySinceLastWeek.mock.calls.length).toBeGreaterThanOrEqual(7);
    });

    test.each(firstWeekDays)(`should have precise timestamps (firstWeekDay => %i)`, firstWeekDayParam => {
        lastWeekTimestamps.firstWeekDay = firstWeekDayParam as WeekDay;

        const { firstWeekDay, from, to } = lastWeekTimestamps;
        const dateAfter = new Date(to + 1);
        const dateBefore = new Date(from - 1);

        expect(dateAfter.getDay()).toBe(firstWeekDay);
        expect(dateBefore.getDay()).toBe(((firstWeekDay as number) + 6) % 7);
    });

    test('should have precise timestamps for timezone (firstWeekDay => 1)', () => {
        const range = getDateRangeContext(() => lastWeek(1));
        const { now: initialNow, timezone: initialTimezone } = range;

        const TIMEZONES = new Map([
            [
                'America/Toronto',
                [
                    asTimestamp(['Apr 4, 2022, 12:00 AM GMT-4', 'Apr 10, 2022, 23:59:59.999 GMT-4']),
                    asTimestamp(['Dec 18, 2023, 12:00 AM GMT-5', 'Dec 24, 2023, 23:59:59.999 GMT-5']),
                    asTimestamp(['Dec 18, 2023, 12:00 AM GMT-5', 'Dec 24, 2023, 23:59:59.999 GMT-5']),
                ],
            ],
            [
                'Asia/Tokyo',
                [
                    asTimestamp(['Apr 4, 2022, 12:00 AM GMT+9', 'Apr 10, 2022, 23:59:59.999 GMT+9']),
                    asTimestamp(['Dec 25, 2023, 12:00 AM GMT+9', 'Dec 31, 2023, 23:59:59.999 GMT+9']),
                    asTimestamp(['Dec 25, 2023, 12:00 AM GMT+9', 'Dec 31, 2023, 23:59:59.999 GMT+9']),
                ],
            ],
        ]);

        TIMEZONES.forEach((timestamps, timezone) => {
            range.timezone = timezone;

            TIMEZONE_TESTS_TIMESTAMPS.forEach((timestamp, index) => {
                const [fromTimestamp, toTimestamp] = timestamps[index]!;
                range.now = timestamp;
                expect(range.from).toBe(fromTimestamp);
                expect(range.to).toBe(toTimestamp);
            });

            // reset now and tz
            range.now = initialNow;
            range.timezone = initialTimezone;
        });
    });
});
