import { describe, expect, test } from 'vitest';
import { getDateRangeContext, getMonthDays } from './shared/test-utils';
import type { Month } from '../../types';
import lastMonth from './lastMonth';

describe('last month', () => {
    test('should be previous month', () => {
        const { fromDate, nowDate, toDate } = getDateRangeContext(lastMonth);
        const fromMonth = fromDate.getMonth();
        const fromYear = fromDate.getFullYear();
        const fromMonthDays = getMonthDays(fromMonth as Month, fromYear);
        const nowMonth = nowDate.getMonth();
        const nowYear = nowDate.getFullYear();
        const toMonth = toDate.getMonth();
        const toYear = toDate.getFullYear();

        expect(fromYear).toBe(toYear); // same year
        expect(fromMonth).toBe(toMonth); // same month
        expect(fromDate.getDate()).toBe(1); // first day of month
        expect(toDate.getDate()).toBe(fromMonthDays); // last day of month

        if (nowMonth === 0) {
            expect(fromMonth).toBe(11); // last month of year
            expect(fromYear).toBe(nowYear - 1); // previous year
        } else {
            expect(fromMonth).toBe(nowMonth - 1); // previous month
            expect(fromYear).toBe(nowYear); // this year
        }
    });

    test('should have precise timestamps', () => {
        const { fromDate, nowDate, from, to } = getDateRangeContext(lastMonth);
        const nowMonth = nowDate.getMonth();
        const fromMonth = fromDate.getMonth();
        const monthAfter = new Date(to + 1).getMonth();
        const monthBefore = new Date(from - 1).getMonth();

        expect(monthAfter).toBe(nowMonth);

        fromMonth === 0 ? expect(monthBefore).toBe(11) : expect(monthBefore).toBe(fromMonth - 1);
    });
});
