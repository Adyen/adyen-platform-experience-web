import { isString } from '../value/is';

export const parseTimestamp = (value?: Date | number | string): number | undefined => {
    const date = value instanceof Date ? value : new Date((isString(value) || Number.isFinite(value) ? value : undefined)!);
    const timestamp = date.getTime();
    return Number.isFinite(timestamp) ? timestamp : undefined;
};

export const startOfDay = (date: Date | number = Date.now()) => new Date(date).setHours(0, 0, 0, 0);

export const startOfNextDay = (startDateOfDay: Date | number = startOfDay()) => {
    const startDate = new Date(startDateOfDay);
    return startDate.setDate(startDate.getDate() + 1);
};
