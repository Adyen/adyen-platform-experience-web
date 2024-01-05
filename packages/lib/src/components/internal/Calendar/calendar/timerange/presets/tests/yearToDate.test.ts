import { describe, expect, test } from 'vitest';
import { getDateRangeContext } from './test-utils';
import yearToDate from '../yearToDate';

describe('year to date', () => {
    test('should be current year', () => {
        const { fromDate, nowDate, toDate } = getDateRangeContext(yearToDate);
        const fromMonth = fromDate.getMonth();
        const fromYear = fromDate.getFullYear();
        const nowMonth = nowDate.getMonth();
        const nowYear = nowDate.getFullYear();
        const toMonth = toDate.getMonth();
        const toYear = toDate.getFullYear();

        expect(fromYear).toBe(nowYear); // current year
        expect(fromMonth).toBe(0); // first month

        expect(toYear).toBe(nowYear); // same year
        expect(toMonth).toBe(nowMonth); // current month

        expect(fromDate.getDate()).toBe(1); // first day of month
        expect(toDate.getDate()).toBe(nowDate.getDate()); // today
    });

    test('should have precise timestamps', () => {
        const { from, fromDate, now, to } = getDateRangeContext(yearToDate);
        const dateBefore = new Date(from - 1);
        const fromYear = fromDate.getFullYear();
        const monthBefore = dateBefore.getMonth();
        const yearBefore = dateBefore.getFullYear();

        expect(to).toBe(now);
        expect(monthBefore).toBe(11);
        expect(yearBefore).toBe(fromYear - 1);
    });
});
