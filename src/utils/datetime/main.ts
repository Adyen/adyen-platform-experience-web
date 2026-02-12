import { isString } from '../value/is';
import type { DateFunction, DateTimeComponents } from './types';

const MINUTE_IN_MS = 60 * 1000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;
const WEEK_IN_MS = 7 * DAY_IN_MS;

export const parseDate = ((...args) => {
    const [value] = args;

    const date =
        args.length >= 2
            ? new Date(...(args as DateTimeComponents))
            : value instanceof Date
              ? value
              : new Date((isString(value) || Number.isFinite(value) ? value : undefined)!);

    const timestamp = date.getTime();
    return Number.isFinite(timestamp) ? timestamp : undefined;
}) as DateFunction<number | undefined>;

export const transformToMS = (unit: string, value: number): number => {
    switch (unit) {
        case 'hour':
            return value * HOUR_IN_MS;
        case 'minute':
            return value * MINUTE_IN_MS;
        case 'day':
            return value * DAY_IN_MS;
        case 'week':
            return value * WEEK_IN_MS;
        default:
            console.warn(`Unknown unit: ${unit}`);
            return 0;
    }
};
