import { useMemo, useRef, useState } from 'preact/hooks';
import restamper, { RestampContext } from '@src/core/Localization/datetime/restamper';
import { getGMTSuffixForTimezoneOffset, getTimezoneOffsetFromFormattedDateString } from '@src/core/Localization/datetime/restamper/utils';
import { EMPTY_ARRAY, EMPTY_OBJECT, noop } from '@src/utils/common';
import clock from '../clock';

export type UseTimezoneConfig = {
    timezone?: RestampContext['TIMEZONE'];
    withClock?: boolean;
};

export const { getTimezoneTime, getUsedTimezone } = (() => {
    const REGEX_CLOCK_TIME_MATCHER = /(\d{2}):(\d{2})(?=:\d{2}(?:\.\d+)?\s+([AP]M))/i;
    const REGEX_GMT_OFFSET_UNWANTED_SUBSTRINGS = /^GMT|0(?=\d:00)|:00/g;
    const $restamper = restamper();

    const getTimezoneTime = (timezone: RestampContext['TIMEZONE'], timestamp = Date.now()) => {
        $restamper.tz = timezone!; // switch restamper to this timezone

        const { formatted } = $restamper(timestamp);
        const [time = '', , , meridian = ''] = formatted?.match(REGEX_CLOCK_TIME_MATCHER) ?? EMPTY_ARRAY;
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
    const shouldWatchClock = useMemo(() => withClock === true, [withClock]);
    const timezone = useMemo(() => getUsedTimezone(tz), [tz]);
    const unwatchClock = useRef(noop);

    const [timestamp, setTimestamp] = useState(Date.now());
    const [clockTime, GMTOffset] = useMemo(() => getTimezoneTime(timezone, timestamp), [timestamp, timezone]);

    useMemo(() => {
        unwatchClock.current();

        unwatchClock.current = shouldWatchClock
            ? clock.watch(snapshotOrSignal => {
                  if (typeof snapshotOrSignal === 'symbol') return;
                  setTimestamp(snapshotOrSignal.timestamp);
              })
            : noop;
    }, [setTimestamp, shouldWatchClock]);

    return { clockTime, GMTOffset, timestamp, timezone } as const;
};

export default useTimezone;
