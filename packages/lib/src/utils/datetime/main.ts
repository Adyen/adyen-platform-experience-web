import { isString } from '../value/is';
import type { DateFunction, DateTimeComponents } from './types';

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
