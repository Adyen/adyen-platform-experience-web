import { zoneFrom } from './main';
import { getter, noop } from '../../../utils';
import { dateFrom, getResolvedTimezone, getTimezoneFormatter, getTimezoneUTCOffset, matchTimezoneFormattedString, restamp } from './utils';
import type { DateValue } from '../../../utils/datetime/types';
import type { RecordWithTimezone } from '../types';

const DATE_PARTS_REGEXP = /^(\d{2})\/(\d{2})\/(-?\d+),\s+(\d{2}):(\d{2}):(\d{2}).(\d{3})/;

export class Zone implements RecordWithTimezone {
    declare readonly defaultFormatter: Intl.DateTimeFormat;
    declare readonly timezone: string;

    constructor(timezone: string) {
        const defaultFormatter = getTimezoneFormatter(timezone);
        Object.defineProperties(this, {
            defaultFormatter: getter(() => defaultFormatter),
            timezone: getter(() => timezone),
        });
    }

    computedTime(date: DateValue, performTimeAdjustments = noop as unknown as (restampedDate: Date, zone: Zone) => unknown) {
        const zone = zoneFrom(this);
        const time = dateFrom(zone.timezoneToSystem(date));
        performTimeAdjustments(time, zone);
        return zone.systemToTimezone(time);
    }

    dateParts(date: DateValue) {
        const dateParts = matchTimezoneFormattedString.call(this, DATE_PARTS_REGEXP, dateFrom(date));
        const [month = '', day = '', year = '', hrs = '', mins = '', secs = '', ms = ''] = dateParts;
        return [+year, +month - 1, +day, +hrs, +mins, +secs, +ms] as const;
    }

    get isSystemTimezone() {
        return this.timezone === getResolvedTimezone();
    }

    systemToTimezone(date: DateValue) {
        return restamp.call(this, date, 1);
    }

    timezoneOffsets(date: DateValue) {
        const time = dateFrom(date);
        const systemOffset = time.getTimezoneOffset();
        const timezoneUTCOffset = getTimezoneUTCOffset.call(this, time);
        return [timezoneUTCOffset, timezoneUTCOffset - systemOffset] as const;
    }

    timezoneToSystem(date: DateValue) {
        return restamp.call(this, date, -1);
    }
}

export default Zone;
