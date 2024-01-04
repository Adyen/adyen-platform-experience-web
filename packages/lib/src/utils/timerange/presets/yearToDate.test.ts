import { beforeEach, describe, expect, test } from 'vitest';
import yearToDate from './yearToDate';
import type { RangeTimestamps } from '../types';

describe('year to date', () => {
    type DateRange = {
        currentDate: Date;
        fromDate: Date;
        toDate: Date;
        from: RangeTimestamps['from'];
        now: RangeTimestamps['now'];
        to: RangeTimestamps['to'];
    };

    beforeEach<DateRange>(context => {
        const { from, now, to } = yearToDate();
        context.currentDate = new Date((context.now = now));
        context.fromDate = new Date((context.from = from));
        context.toDate = new Date((context.to = to));
    });

    test<DateRange>('should be current year', ({ currentDate, fromDate, toDate }) => {
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const fromMonth = fromDate.getMonth();
        const fromYear = fromDate.getFullYear();
        const toMonth = toDate.getMonth();
        const toYear = toDate.getFullYear();

        expect(fromYear).toBe(currentYear); // current year
        expect(fromMonth).toBe(0); // first month

        expect(toYear).toBe(currentYear); // same year
        expect(toMonth).toBe(currentMonth); // current month

        expect(fromDate.getDate()).toBe(1); // first day of month
        expect(toDate.getDate()).toBe(currentDate.getDate()); // today
    });

    test<DateRange>('should have precise timestamps', ({ from, fromDate, now, to }) => {
        const dateBefore = new Date(from - 1);
        const fromYear = fromDate.getFullYear();
        const monthBefore = dateBefore.getMonth();
        const yearBefore = dateBefore.getFullYear();

        expect(to).toBe(now);
        expect(monthBefore).toBe(11);
        expect(yearBefore).toBe(fromYear - 1);
    });
});
