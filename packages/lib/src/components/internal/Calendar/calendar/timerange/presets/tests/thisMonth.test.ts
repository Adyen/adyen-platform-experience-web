import { describe, expect, test } from 'vitest';
import { getDateRangeContext } from './test-utils';
import thisMonth from '../thisMonth';

describe('this month', () => {
    test('should be current month', () => {
        const { fromDate, nowDate, toDate } = getDateRangeContext(thisMonth);
        const fromMonth = fromDate.getMonth();
        const fromYear = fromDate.getFullYear();
        const nowMonth = nowDate.getMonth();
        const nowYear = nowDate.getFullYear();
        const toMonth = toDate.getMonth();
        const toYear = toDate.getFullYear();

        expect(fromYear).toBe(nowYear); // current year
        expect(fromMonth).toBe(nowMonth); // current month

        expect(fromYear).toBe(toYear); // same year
        expect(fromMonth).toBe(toMonth); // same month
        expect(fromDate.getDate()).toBe(1); // first day of month
        expect(toDate.getDate()).toBe(nowDate.getDate()); // today
    });

    test('should have precise timestamps', () => {
        const { nowDate, from, now, to } = getDateRangeContext(thisMonth);
        const nowMonth = nowDate.getMonth();
        const monthBefore = new Date(from - 1).getMonth();

        expect(to).toBe(now);

        nowMonth === 0 ? expect(monthBefore).toBe(11) : expect(monthBefore).toBe(nowMonth - 1);
    });
});
