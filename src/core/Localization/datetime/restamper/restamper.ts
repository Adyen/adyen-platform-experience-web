import { isNullish, isUndefined, struct } from '../../../../utils';
import { BASE_FORMAT_OPTIONS, BASE_LOCALE, SYSTEM_TIMEZONE, SYSTEM_TIMEZONE_FORMATTER } from './constants';
import type { RestampContext, RestamperWithTimezone, RestampResult } from './types';
import { getTimezoneOffsetForTimestamp } from './utils';

const restamper = (() => {
    let getTimeZone: (this: RestampContext) => RestampContext['TIMEZONE'];
    let setTimeZone: (this: RestampContext, timezone?: RestampContext['TIMEZONE'] | null) => void;

    if (!isUndefined(SYSTEM_TIMEZONE)) {
        getTimeZone = function () {
            return this.TIMEZONE;
        };

        setTimeZone = function (timeZone) {
            if (!isNullish(timeZone)) {
                try {
                    const nextFormatter = new Intl.DateTimeFormat(BASE_LOCALE, { ...BASE_FORMAT_OPTIONS, timeZone });
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
                this.formatter = SYSTEM_TIMEZONE_FORMATTER;
            }
        };
    }

    function restamp(this: RestampContext, ...args: [(string | number | Date)?]): RestampResult {
        if (args.length === 0) return restamp.call(this, Date.now());

        const time = args[0];
        const timestamp = new Date(time as NonNullable<typeof time>).getTime();
        const formatter = this.formatter ?? SYSTEM_TIMEZONE_FORMATTER;

        return Object.freeze({
            formatted: formatter?.format(new Date(timestamp)),
            offset: getTimezoneOffsetForTimestamp(timestamp, formatter),
            timestamp,
        } as const);
    }

    return () => {
        const context = { TIMEZONE: SYSTEM_TIMEZONE } as RestampContext;
        const set = setTimeZone?.bind(context);

        const tz = struct({
            current: { get: getTimeZone?.bind(context), set },
            system: { value: SYSTEM_TIMEZONE },
        });

        return Object.defineProperties(restamp.bind(context) as RestamperWithTimezone, {
            tz: { get: () => tz, set },
        });
    };
})();

export default restamper;
