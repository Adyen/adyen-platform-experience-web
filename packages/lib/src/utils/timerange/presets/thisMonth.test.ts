import { beforeEach, describe, expect, test } from 'vitest';
import thisMonth from './thisMonth';
import type { RangeTimestamps } from '../types';

describe('this month', () => {
    type DateRange = {
        currentDate: Date;
        fromDate: Date;
        toDate: Date;
        from: RangeTimestamps['from'];
        now: RangeTimestamps['now'];
        to: RangeTimestamps['to'];
    };

    beforeEach<DateRange>(context => {
        const { from, now, to } = thisMonth();
        context.currentDate = new Date((context.now = now));
        context.fromDate = new Date((context.from = from));
        context.toDate = new Date((context.to = to));
    });

    test<DateRange>('should be current month', ({ currentDate, fromDate, toDate }) => {
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const fromMonth = fromDate.getMonth();
        const fromYear = fromDate.getFullYear();
        const toMonth = toDate.getMonth();
        const toYear = toDate.getFullYear();

        expect(fromYear).toBe(currentYear); // current year
        expect(fromMonth).toBe(currentMonth); // current month

        expect(fromYear).toBe(toYear); // same year
        expect(fromMonth).toBe(toMonth); // same month
        expect(fromDate.getDate()).toBe(1); // first day of month
        expect(toDate.getDate()).toBe(currentDate.getDate()); // today
    });

    test<DateRange>('should have precise timestamps', ({ currentDate, from, now, to }) => {
        const currentMonth = currentDate.getMonth();
        const monthBefore = new Date(from - 1).getMonth();

        expect(to).toBe(now);

        currentMonth === 0 ? expect(monthBefore).toBe(11) : expect(monthBefore).toBe(currentMonth - 1);
    });
});
