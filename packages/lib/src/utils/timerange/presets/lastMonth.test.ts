import { beforeEach, describe, expect, test } from 'vitest';
import lastMonth from './lastMonth';
import type { RangeTimestamps } from '../types';

describe('last month', () => {
    type DateRange = {
        currentDate: Date;
        fromDate: Date;
        toDate: Date;
        from: RangeTimestamps['from'];
        now: RangeTimestamps['now'];
        to: RangeTimestamps['to'];
    };

    beforeEach<DateRange>(context => {
        const { from, now, to } = lastMonth();
        context.currentDate = new Date((context.now = now));
        context.fromDate = new Date((context.from = from));
        context.toDate = new Date((context.to = to));
    });

    test<DateRange>('should be previous month', ({ currentDate, fromDate, toDate }) => {
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const fromMonth = fromDate.getMonth();
        const fromYear = fromDate.getFullYear();
        const toMonth = toDate.getMonth();
        const toYear = toDate.getFullYear();

        expect(fromYear).toBe(toYear); // same year
        expect(fromMonth).toBe(toMonth); // same month
        expect(fromDate.getDate()).toBe(1); // first day of month

        switch (fromMonth) {
            case 0:
            case 2:
            case 4:
            case 6:
            case 7:
            case 9:
            case 11:
                expect(toDate.getDate()).toBe(31); // last day of month
                break;
            case 3:
            case 5:
            case 8:
            case 10:
                expect(toDate.getDate()).toBe(30); // last day of month
                break;
            default:
                expect(toDate.getDate()).toMatch(/^2[89]$/); // last day of month
                break;
        }

        if (currentMonth === 0) {
            expect(fromMonth).toBe(11); // last month of year
            expect(fromYear).toBe(currentYear - 1); // previous year
        } else {
            expect(fromMonth).toBe(currentMonth - 1); // previous month
            expect(fromYear).toBe(currentYear); // this year
        }
    });

    test<DateRange>('should have precise timestamps', ({ currentDate, fromDate, from, to }) => {
        const currentMonth = currentDate.getMonth();
        const fromMonth = fromDate.getMonth();
        const monthAfter = new Date(to + 1).getMonth();
        const monthBefore = new Date(from - 1).getMonth();

        expect(monthAfter).toBe(currentMonth);

        fromMonth === 0 ? expect(monthBefore).toBe(11) : expect(monthBefore).toBe(fromMonth - 1);
    });
});
