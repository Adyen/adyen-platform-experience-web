import { asTimestamp } from './helpers';
import type { RangeTimestamps } from '../../types';
import { getter } from '../../utils';

type _DateRangeContext = {
    fromDate: Date;
    nowDate: Date;
    toDate: Date;
};

export type DateRangeContext<T extends Record<any, any> = {}> = Readonly<_DateRangeContext> &
    Readonly<{
        from: RangeTimestamps['from'];
        to: RangeTimestamps['to'];
    }> & {
        now: RangeTimestamps['now'];
        timezone: RangeTimestamps['timezone'];
    } & Omit<RangeTimestamps<T>, 'from' | 'now' | 'timezone' | 'to'>;

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

export const TIMEZONE_TESTS_TIMESTAMPS = asTimestamp(['Apr 15, 2022, 1:30 PM GMT', 'Dec 31, 2023, 5:30 PM GMT', 'Jan 1, 2024, 3:30 AM GMT']);
