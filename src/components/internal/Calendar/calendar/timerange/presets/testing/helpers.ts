import type { Month, MonthDays } from '../../../types';

export const asTimestamp = (dates: any[]) => dates.map(date => new Date(date).getTime());

const isLeapYear = (year: number) => (year % 100 ? year % 4 : year % 400) === 0;

export const getMonthDays = (month: Month, year: number): MonthDays => {
    switch (month) {
        case 3:
        case 5:
        case 8:
        case 10:
            return 30;
        case 1:
            return isLeapYear(year) ? 29 : 28;
        default:
            return 31;
    }
};
