import { EMPTY_OBJECT } from '@src/utils/common';
import type { RangeTimestampConfig, TimeRange } from './types';
import { getRangeConfigUnwrapper, isRangeFromTimestampWithOffset, isRangeTimestamps, parseTimestamp } from './utils';

const createTimeRange = (config: RangeTimestampConfig): TimeRange => {
    let { from, to, now: NOW = Date.now() } = EMPTY_OBJECT as TimeRange;
    const unwrap = getRangeConfigUnwrapper(config);

    const compute = (() => {
        NOW = Date.now();

        parsing: {
            if (isRangeTimestamps(config)) {
                from = parseTimestamp(unwrap(config.from)) ?? NOW;
                to = parseTimestamp(unwrap(config.to)) ?? NOW;
                break parsing;
            }

            let date: Date;
            let direction: 1 | -1;
            let withRangeFrom: boolean;

            if ((withRangeFrom = isRangeFromTimestampWithOffset(config))) {
                date = new Date((from = parseTimestamp(unwrap(config.from)) ?? NOW));
                direction = 1;
            } else {
                date = new Date((to = parseTimestamp(unwrap(config.to)) ?? NOW));
                direction = -1;
            }

            const [years = 0, months = 0, days = 0, hours = 0, minutes = 0, seconds = 0, ms = 0] = unwrap(config.offset);

            date.setFullYear(date.getFullYear() + years * direction, date.getMonth() + months * direction, date.getDate() + days * direction);

            date.setHours(
                date.getHours() + hours * direction,
                date.getMinutes() + minutes * direction,
                date.getSeconds() + seconds * direction,
                date.getMilliseconds() + ms * direction
            );

            withRangeFrom ? (to = parseTimestamp(date.getTime()) ?? NOW) : (from = parseTimestamp(date.getTime()) ?? NOW);
        }

        if (from > to) [from, to] = [to, from];
    }) as TimeRange;

    compute();

    return Object.defineProperties(compute, {
        now: { enumerable: true, get: () => NOW },
        from: { enumerable: true, get: () => from },
        to: { enumerable: true, get: () => to },
    });
};

export default createTimeRange;
