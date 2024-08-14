import restamper, { systemToTimezone, timezoneToSystem } from '../../../../core/Localization/datetime/restamper';
import { BASE_LOCALE } from '../../../../core/Localization/datetime/restamper/constants';
import { DEFAULT_DATETIME_FORMAT } from '../../../../core/Localization/constants/localization';
import { EMPTY_ARRAY, EMPTY_OBJECT, identity, isInfinity, isUndefined, mod } from '../../../../utils';
import type { Month, MonthDays, Time, WeekDay } from './types';

const DATE_PARTS_REGEX = /^(\d{2})\/(\d{2})\/(-?\d+)$/;

const _startTimestamp =
    <RestArgs extends any[], DateAdjustmentFn extends (date: Date, ...args: RestArgs) => Date | number>(
        adjustDate = identity as unknown as DateAdjustmentFn
    ) =>
    (timestamp: Date | number, timezone?: string, ...args: RestArgs) => {
        const date = new Date(timestamp);
        const restamper = withTimezone(timezone);
        const restampedDate = new Date(timezoneToSystem(restamper, timestamp));

        let diff = (date.getDate() - restampedDate.getDate()) as -1 | 1 | 0;

        if (diff) {
            // Diff correction for either of these cases:
            // - between first (1) and last (28, 29, 30, 31) days of neighbouring months
            // - between first (0) and last (11) months of neighbouring years
            diff = diff > 1 ? -1 : diff < -1 ? 1 : diff;
        }

        date.setDate(date.getDate() - diff);
        date.setHours(0, 0, 0, 0);
        return systemToTimezone(restamper, adjustDate(date, ...args));
    };

export const startOfDay = _startTimestamp();
export const startOfMonth = _startTimestamp(date => date.setDate(1));
export const startOfYear = _startTimestamp(date => date.setMonth(0, 1));

export const startOfWeek = _startTimestamp((date, firstWeekDay?: WeekDay) => {
    const dateOffset = getWeekDayIndex(date.getDay() as WeekDay, firstWeekDay ?? 0);
    return date.setDate(date.getDate() - dateOffset);
});

export const isLeapYear = (year: number) => (year % 100 ? year % 4 : year % 400) === 0;

export const getMonthDays = (month: Month, year: number, offset = 0) => {
    const nextMonth = month + offset;
    const monthIndex = mod(nextMonth, 12) as Month;
    const nextYear = year + Math.floor(nextMonth / 12);

    let days: MonthDays = 31;

    switch (monthIndex) {
        case 1:
            days = isLeapYear(nextYear) ? 29 : 28;
            break;
        case 3:
        case 5:
        case 8:
        case 10:
            days = 30;
            break;
    }

    return [days, monthIndex, nextYear] as const;
};

export const getWeekDayIndex = (weekDay: WeekDay, firstWeekDay: WeekDay = 0) => ((7 - firstWeekDay + weekDay) % 7) as WeekDay;

export const computeTimestampOffset = (timestamp: number, timezone?: string) =>
    isInfinity(timestamp) ? 0 : timestamp - startOfDay(timestamp, timezone);

export const getDateObjectFromTimestamp = (timestamp?: number) => (isUndefined(timestamp) ? timestamp : new Date(timestamp));

export const getTimezoneDateString = (date: number | string | Date, options: Intl.DateTimeFormatOptions = EMPTY_OBJECT) => {
    const restamper = withTimezone(options.timeZone);
    const dateOptions = { ...DEFAULT_DATETIME_FORMAT, ...options, timeZone: restamper.tz.current };
    return new Date(date).toLocaleDateString(BASE_LOCALE, dateOptions);
};

export const getTimezoneDateParts = (date: number | string | Date, timeZone?: string) => {
    const [, month = '', day = '', year = ''] = getTimezoneDateString(date, { timeZone }).match(DATE_PARTS_REGEX) ?? EMPTY_ARRAY;
    return [+year, +month - 1, +day] as const;
};

export const getEdgesDistance = (fromTime: Time, toTime: Time, timezone?: string) => {
    if (isInfinity(fromTime) || isInfinity(toTime)) return Infinity;
    const [fromYear, fromMonth] = getTimezoneDateParts(fromTime, timezone);
    const [toYear, toMonth] = getTimezoneDateParts(toTime, timezone);
    return Math.abs(toMonth - fromMonth + (toYear - fromYear) * 12);
};

export const withTimezone = (() => {
    const _restamper = restamper();
    return (timezone?: string) => {
        _restamper.tz = undefined; // first reset to system timezone
        _restamper.tz = timezone;
        return _restamper;
    };
})();
