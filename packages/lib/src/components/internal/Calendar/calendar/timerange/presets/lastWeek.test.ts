import { describe, expect, test, vi } from 'vitest';
import { getDateRangeContext } from './shared/test-utils';
import type { WeekDay } from '../../types';
import lastWeek from './lastWeek';

describe('last week', () => {
    const lastWeekTimestamps = getDateRangeContext(lastWeek);

    const runTestsFor = (firstWeekDay?: WeekDay) => {
        const which = firstWeekDay === undefined ? 'default' : `${firstWeekDay}`;

        test(`should be previous week (firstWeekDay => ${which})`, () => {
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

        test(`should have precise timestamps (firstWeekDay => ${which})`, () => {
            const { firstWeekDay, from, to } = lastWeekTimestamps;
            const dateAfter = new Date(to + 1);
            const dateBefore = new Date(from - 1);

            expect(dateAfter.getDay()).toBe(firstWeekDay);
            expect(dateBefore.getDay()).toBe(((firstWeekDay as number) + 6) % 7);
        });
    };

    // test with default `firstWeekDay`
    runTestsFor();

    // test with all possible values for `firstWeekDay`
    for (let i = 0; i < 7; i++) {
        lastWeekTimestamps.firstWeekDay = i as WeekDay;
        runTestsFor(lastWeekTimestamps.firstWeekDay);
    }
});
