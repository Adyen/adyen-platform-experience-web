import { useEffect, useMemo, useState } from 'preact/hooks';
import restamper, { RestampContext } from '../../../../core/Localization/datetime/restamper';
import { getGMTSuffixForTimezoneOffset, getTimezoneOffsetFromFormattedDateString } from '../../../../core/Localization/datetime/restamper/utils';
import { isWatchlistUnsubscribeToken } from '../../../../primitives/reactive/watchlist';
import { boolOrFalse, EMPTY_ARRAY, EMPTY_OBJECT } from '../../../../utils';
import clock from '../../../../primitives/time/clock';

export type UseTimezoneConfig = {
    timezone?: RestampContext['TIMEZONE'];
    withClock?: boolean;
};

export const { getTimezoneTime, getUsedTimezone } = (() => {
    const REGEX_CLOCK_TIME_MATCHER = /\d{2}:\d{2}(?=:\d{2}(?:\.\d+)?\s+([AP]M))/i;
    const REGEX_GMT_OFFSET_UNWANTED_SUBSTRINGS = /^GMT|0(?=\d:00)|:00/g;
    const $restamper = restamper();

    const getTimezoneTime = (timezone: RestampContext['TIMEZONE'], timestamp = Date.now()) => {
        $restamper.tz = timezone!; // switch restamper to this timezone

        const { formatted } = $restamper(timestamp);
        const [time = '', meridian = ''] = formatted?.match(REGEX_CLOCK_TIME_MATCHER) ?? EMPTY_ARRAY;
        const offset = getTimezoneOffsetFromFormattedDateString(formatted);
        const clockTime = `${time}${meridian && ` ${meridian}`}`;
        const GMTOffsetString = getGMTSuffixForTimezoneOffset(offset).replace(REGEX_GMT_OFFSET_UNWANTED_SUBSTRINGS, '');

        return [clockTime, GMTOffsetString] as const;
    };

    const getUsedTimezone = (timezone?: RestampContext['TIMEZONE']) => {
        $restamper.tz = timezone;
        return $restamper.tz.current!;
    };

    return { getTimezoneTime, getUsedTimezone } as const;
})();

const useTimezone = ({ timezone: tz, withClock = false }: UseTimezoneConfig = EMPTY_OBJECT) => {
    const shouldWatchClock = useMemo(() => boolOrFalse(withClock), [withClock]);
    const timezone = useMemo(() => getUsedTimezone(tz), [tz]);

    const [timestamp, setTimestamp] = useState(Date.now());
    const [clockTime, GMTOffset] = useMemo(() => getTimezoneTime(timezone, timestamp), [timestamp, timezone]);

    useEffect(() => {
        if (!shouldWatchClock) return;

        return clock.subscribe(snapshot => {
            if (!isWatchlistUnsubscribeToken(snapshot)) {
                setTimestamp(snapshot.now);
            }
        });
    }, [setTimestamp, shouldWatchClock]);

    return { clockTime, GMTOffset, timestamp, timezone } as const;
};

export default useTimezone;
