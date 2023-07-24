import { Month, Time } from './types';

const call = Function.prototype.bind.bind(Function.prototype.call);
const createObject = Object.create;

export const mod = (int: number, mod: number) => ((int % mod) + mod) % mod;
export const struct = call(createObject, null, null);
export const structFrom = call(createObject, null);

export const isNumber = (value: any): value is number => typeof value === 'number';
export const isInfinite = (value: any): value is number => isNumber(value) && 1 / value === 0;

export const getEdgesDistance = (fromTime: Time, toTime: Time) => {
    if (isInfinite(fromTime) || isInfinite(toTime)) return Infinity;
    const from = new Date(fromTime);
    const to = new Date(toTime);
    return Math.abs(to.getMonth() - from.getMonth() + (to.getFullYear() - from.getFullYear()) * 12);
};

export const getMonthDays = (() => {
    const DAYS = [31, [28, 29] as const, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

    return (month: Month, year: number, offset = 0) => {
        const nextMonth = month + offset;
        const monthIndex = (nextMonth % 12) as Month;
        const nextYear = year + Math.floor(nextMonth / 12);
        const days = monthIndex === 1 ? DAYS[1][(nextYear % 100 ? nextYear % 4 : nextYear % 400) && 1] : DAYS[monthIndex];

        return [days, monthIndex, nextYear] as const;
    };
})();
