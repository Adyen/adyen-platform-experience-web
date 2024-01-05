import type { RangeTimestamps } from '../../types';
import type { Month, MonthDays } from '../../../types';

export type DateRangeContext<T extends Record<any, any> = {}> = Readonly<{
    fromDate: Date;
    nowDate: Date;
    toDate: Date;
    from: RangeTimestamps['from'];
    now: RangeTimestamps['now'];
    to: RangeTimestamps['to'];
}> &
    Omit<Readonly<RangeTimestamps<T>>, 'from' | 'now' | 'to'>;

export const isLeapYear = (year: number) => (year % 100 ? year % 4 : year % 400) === 0;

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

export const getDateRangeContext = <T extends Record<any, any> = {}>(factory: () => RangeTimestamps<T>): DateRangeContext<T> => {
    const { from, now, to, ...restContextProps } = factory();
    const fromDate = new Date(from);
    const nowDate = new Date(now);
    const toDate = new Date(to);
    return { ...restContextProps, from, fromDate, now, nowDate, to, toDate };
};
