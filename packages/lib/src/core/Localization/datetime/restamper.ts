import { EMPTY_ARRAY, mod } from '@src/utils/common';
import type { Restamp, RestampContext, RestampResult } from '../types';

export const REGEX_TZ_OFFSET = /(?<=GMT)(?:[-+](?:0?\d|1[0-4])(?::?[0-5]\d)?)?$/;

const restamper = (() => {
    const BASE_LOCALE = 'en-US' as const;
    const DIGITS_2 = '2-digit' as const;
    const NUMERIC = 'numeric' as const;
    const SHORT = 'short' as const;

    let FORMAT_OPTIONS: Readonly<Intl.DateTimeFormatOptions> | undefined;
    let SYSTEM_TIMEZONE: Restamp['tz'];

    let getTimeZone: (this: RestampContext) => Restamp['tz'];
    let setTimeZone: (this: RestampContext, timezone?: Restamp['tz'] | null) => void;
    let systemTimezoneFormatter: RestampContext['formatter'];

    const computeMinutesOffset = (hrs: number, mins: number) => (Math.abs(hrs * 60) + mins) * (hrs < 0 ? -1 : 1);
    const parseOffset = (offset: string) => parseInt(offset, 10) || 0;

    const getOffsetsFromFormattedDateString = (date?: string): readonly [number, number] => {
        const offsets = date?.match(REGEX_TZ_OFFSET)?.[0].split(':', 2).map(parseOffset) ?? (EMPTY_ARRAY as readonly number[]);
        return Object.freeze(offsets.concat(0, 0).slice(0, 2) as [number, number]);
    };

    const getTimezoneOffsetsForTimestamp = (timestamp: number, timezoneFormatter: RestampContext['formatter'] = systemTimezoneFormatter) => {
        const systemOffset = computeMinutesOffset(...getOffsetsFromFormattedDateString(systemTimezoneFormatter?.format(timestamp)));
        const timezoneOffset = computeMinutesOffset(...getOffsetsFromFormattedDateString(timezoneFormatter?.format(timestamp)));
        const offset = timezoneOffset - systemOffset;

        return Object.freeze([
            Math.floor(offset / 60), // hours offset
            mod(offset, 60), // minutes offset
        ] as const);
    };

    try {
        FORMAT_OPTIONS = Object.freeze({
            year: NUMERIC,
            month: SHORT,
            day: NUMERIC,
            hour: DIGITS_2,
            minute: DIGITS_2,
            second: DIGITS_2,
            fractionalSecondDigits: 3,
            timeZoneName: 'longOffset', // should not be changed — needed for the tz offsets regexp
        });
        systemTimezoneFormatter = new Intl.DateTimeFormat(BASE_LOCALE, FORMAT_OPTIONS);
        SYSTEM_TIMEZONE = systemTimezoneFormatter.resolvedOptions().timeZone;
    } catch (ex) {
        SYSTEM_TIMEZONE = undefined;
    }

    if (SYSTEM_TIMEZONE !== undefined) {
        getTimeZone = function () {
            return this.TIMEZONE;
        };

        setTimeZone = function (timeZone) {
            if (timeZone != undefined) {
                try {
                    const nextFormatter = new Intl.DateTimeFormat(BASE_LOCALE, { ...FORMAT_OPTIONS, timeZone });
                    const nextTimeZone = nextFormatter.resolvedOptions().timeZone;

                    if (this.TIMEZONE === nextTimeZone) return;

                    this.TIMEZONE = nextTimeZone;
                    this.formatter = nextFormatter;
                } catch (ex) {
                    // Silently ignore invalid timezone updates
                    if (import.meta.env.DEV) console.error(ex);
                }
            } else {
                this.TIMEZONE = SYSTEM_TIMEZONE;
                this.formatter = systemTimezoneFormatter;
            }
        };
    }

    function restamp(this: RestampContext, ...args: [(string | number | Date)?]): RestampResult {
        if (args.length === 0) return restamp.call(this, Date.now());

        const time = args[0];
        const timestamp = new Date(time as NonNullable<typeof time>).getTime();
        const formatter = this.formatter ?? systemTimezoneFormatter;

        return Object.freeze({
            formatted: formatter?.format(timestamp),
            offsets: getTimezoneOffsetsForTimestamp(timestamp, formatter),
            timestamp,
        } as const);
    }

    return () => {
        const context = { TIMEZONE: SYSTEM_TIMEZONE } as RestampContext;
        return Object.defineProperties(restamp.bind(context) as Restamp, {
            tz: {
                get: getTimeZone?.bind(context),
                set: setTimeZone?.bind(context),
            },
        });
    };
})();

export default restamper;
