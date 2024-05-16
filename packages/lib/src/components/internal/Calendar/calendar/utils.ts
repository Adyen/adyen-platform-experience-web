import { Month, MonthDays, Time } from './types';
import { isInfinite, mod } from '../../../../utils/common';

export const computeTimestampOffset = (timestamp: number) => (isInfinite(timestamp) ? 0 : timestamp - new Date(timestamp).setHours(0, 0, 0, 0));
export const getDateObjectFromTimestamp = (timestamp?: number) => (timestamp === undefined ? timestamp : new Date(timestamp));

export const getEdgesDistance = (fromTime: Time, toTime: Time) => {
    if (isInfinite(fromTime) || isInfinite(toTime)) return Infinity;
    const from = new Date(fromTime);
    const to = new Date(toTime);
    return Math.abs(to.getMonth() - from.getMonth() + (to.getFullYear() - from.getFullYear()) * 12);
};

export const getMonthDays = (() => {
    const DAYS = [31, [29, 28] as const, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

    return (month: Month, year: number, offset = 0) => {
        const nextMonth = month + offset;
        const monthIndex = mod(nextMonth, 12) as Month;
        const nextYear = year + Math.floor(nextMonth / 12);
        const days = monthIndex === 1 ? DAYS[1][(nextYear % 100 ? nextYear % 4 : nextYear % 400) && 1] : DAYS[monthIndex];

        return [days as MonthDays, monthIndex, nextYear] as const;
    };
})();
