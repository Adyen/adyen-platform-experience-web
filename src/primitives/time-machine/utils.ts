import { mod } from '../../utils';
import type { Month, MonthDays, WeekDay } from './types';

export const getMonth = (year: number, month: Month, offsetFromMonth = 0) => {
    const nextMonth = month + offsetFromMonth;
    const offsetMonth = mod(nextMonth, 12) as Month;
    const offsetYear = year + Math.floor(nextMonth / 12);

    let offsetMonthDays: MonthDays = 31;

    switch (offsetMonth) {
        case 1:
            offsetMonthDays = isLeapYear(offsetYear) ? 29 : 28;
            break;
        case 3:
        case 5:
        case 8:
        case 10:
            offsetMonthDays = 30;
            break;
    }

    return [offsetYear, offsetMonth, offsetMonthDays] as const;
};

export const getWeekDay = (weekDay: WeekDay, firstWeekDay: WeekDay = 0) => ((7 - firstWeekDay + weekDay) % 7) as WeekDay;
export const isLeapYear = (year: number) => (year % 100 ? year % 4 : year % 400) === 0;
