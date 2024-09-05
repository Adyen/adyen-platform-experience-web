import { zoneFrom } from './index';
import { getWeekDay } from '../utils';
import { enumerable } from '../../../utils';
import { dateFrom, getResolvedTimezone, getTimezoneFormatter, getTimezoneUTCOffset, matchTimezoneFormattedString, restamp } from './utils';
import type { DateValue } from '../../../utils/datetime/types';
import type { RecordWithTimezone, WeekDay } from '../types';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const DATE_PARTS_REGEXP = /(?<=^\D*)(\d{2})\/(\d{2})\/(-?\d+),\s+(\d{2}):(\d{2}):(\d{2}).(\d{3})/;
const WEEK_DAY_REGEXP = /^([^,\s]+)/;

export class Zone implements RecordWithTimezone {
    declare readonly formatter: Intl.DateTimeFormat;
    declare readonly timezone: string;

    constructor(timezone: string) {
        const formatter = getTimezoneFormatter(timezone);
        Object.defineProperties(this, {
            formatter: enumerable(formatter),
            timezone: enumerable(timezone),
        });
    }

    fromSystem(date: DateValue) {
        return restamp.call(this, date, 1);
    }

    get isSystem() {
        return this.timezone === getResolvedTimezone();
    }

    offsets(date: DateValue) {
        const time = dateFrom(date);
        const systemOffset = time.getTimezoneOffset();
        const timezoneUTCOffset = getTimezoneUTCOffset.call(this, time) | 0;
        return [timezoneUTCOffset, timezoneUTCOffset - systemOffset] as const;
    }

    time(date: DateValue, timeAdjustment?: (restampedDate: Date, zone: Zone) => unknown) {
        const zone = zoneFrom(this);
        const time = dateFrom(zone.toSystem(date));
        timeAdjustment?.(time, zone);
        return zone.fromSystem(time);
    }

    timeArray(date: DateValue) {
        const dateParts = matchTimezoneFormattedString.call(this, DATE_PARTS_REGEXP, dateFrom(date));
        const [month = '', day = '', year = '', hrs = '', mins = '', secs = '', ms = ''] = dateParts;
        return [+year, +month - 1, +day, +hrs % 24, +mins, +secs, +ms] as const;
    }

    toSystem(date: DateValue) {
        return restamp.call(this, date, -1);
    }

    weekDay(date: DateValue, firstWeekDay: WeekDay = 0) {
        const [weekDay] = matchTimezoneFormattedString.call(this, WEEK_DAY_REGEXP, dateFrom(date));
        return getWeekDay(WEEK_DAYS.indexOf(weekDay as (typeof WEEK_DAYS)[number]) as WeekDay, firstWeekDay);
    }
}

export default Zone;
