import { call, createObject } from './constants';
import { Month, Time } from './types';

export const struct = call(createObject, null, null);
export const structFrom = call(createObject, null);
export const clamp = (min: number, value: number, max: number) => Math.max(min, Math.min(value, max));
export const mid = (low: number, high: number) => low + Math.floor((high - low) / 2);
export const mod = (value: number, mod: number) => ((value % mod) + mod) % mod;
export const isNumber = (value: any): value is number => typeof value === 'number';
export const isInfinite = (value: any): value is number => isNumber(value) && 1 / value === 0;
export const isBitSafeInteger = (value: any): value is number => isNumber(value) && value === ~~value;

export const computeTimestampOffset = (timestamp: number) => (isInfinite(timestamp) ? 0 : timestamp - new Date(timestamp).setHours(0, 0, 0, 0));

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
        const monthIndex = (nextMonth % 12) as Month;
        const nextYear = year + Math.floor(nextMonth / 12);
        const days = monthIndex === 1 ? DAYS[1][(nextYear % 100 ? nextYear % 4 : nextYear % 400) && 1] : DAYS[monthIndex];

        return [days, monthIndex, nextYear] as const;
    };
})();
