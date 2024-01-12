import type { RangeTimestamps } from '../../types';
import type { Month, MonthDays } from '../../../types';
import { getter } from '../../utils';

type _DateRangeContext = {
    fromDate: Date;
    nowDate: Date;
    toDate: Date;
};

export type DateRangeContext<T extends Record<any, any> = {}> = Readonly<
    _DateRangeContext & {
        from: RangeTimestamps['from'];
        now: RangeTimestamps['now'];
        to: RangeTimestamps['to'];
    }
> &
    Omit<RangeTimestamps<T>, 'from' | 'now' | 'to'>;

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

export const getDateRangeContext = <T extends Record<any, any> = {}>(
    factory: () => RangeTimestamps<T> & Partial<_DateRangeContext>
): DateRangeContext<T> => {
    const rangeContext = factory();

    return Object.defineProperties(rangeContext as DateRangeContext<T>, {
        fromDate: getter(() => new Date(rangeContext.from)),
        nowDate: getter(() => new Date(rangeContext.now)),
        toDate: getter(() => new Date(rangeContext.to)),
    });
};
