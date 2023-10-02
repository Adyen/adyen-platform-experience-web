import { Restamp, RestampContext } from '../types';

const restamper = (() => {
    const BASE_LOCALE = 'en-US' as const;
    let FORMAT_OPTIONS: Intl.DateTimeFormatOptions | undefined;
    let SYSTEM_TIMEZONE: Restamp['tz'];

    let getTimeZone: (this: RestampContext) => Restamp['tz'];
    let setTimeZone: (this: RestampContext, timezone?: Restamp['tz'] | null) => void;

    try {
        FORMAT_OPTIONS = { dateStyle: 'short', timeStyle: 'medium' };
        SYSTEM_TIMEZONE = new Intl.DateTimeFormat(BASE_LOCALE, FORMAT_OPTIONS).resolvedOptions().timeZone;
    } catch (ex) {
        SYSTEM_TIMEZONE = FORMAT_OPTIONS = undefined;
    }

    if (SYSTEM_TIMEZONE !== undefined) {
        getTimeZone = function () {
            return this.TIMEZONE;
        };

        setTimeZone = function (timeZone) {
            if (timeZone != undefined) {
                const nextFormatter = new Intl.DateTimeFormat(BASE_LOCALE, { ...FORMAT_OPTIONS, timeZone });
                const nextTimeZone = nextFormatter.resolvedOptions().timeZone;

                if (this.TIMEZONE === nextTimeZone) return;

                this.TIMEZONE = nextTimeZone;
                this.formatter = nextFormatter;
            } else {
                this.TIMEZONE = SYSTEM_TIMEZONE;
                this.formatter = undefined;
            }
        };
    }

    function restamp(this: RestampContext, ...args: [(string | number | Date)?]): number {
        if (args.length === 0) return restamp.call(this, Date.now());

        const time = args[0];
        const timestamp = new Date(time as NonNullable<typeof time>).getTime();

        if (this.formatter === undefined) return timestamp;

        const restampedTimestamp = new Date(this.formatter.format(timestamp)).getTime();

        if (restampedTimestamp !== timestamp) {
            const milliseconds = timestamp % 1000;
            return Math.floor(restampedTimestamp / 1000) * 1000 + milliseconds;
        }

        return restampedTimestamp;
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
