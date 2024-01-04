import { EMPTY_OBJECT, struct } from '@src/utils/common';
import type { RangeTimestamp, RangeTimestamps, RangeTimestampsConfig, RangeTimestampsConfigContext } from './types';
import {
    getter,
    getRangeTimestampsConfigParameterUnwrapper,
    isRangeTimestampsConfigWithFromOffset,
    isRangeTimestampsConfigWithoutOffset,
    parseRangeTimestamp,
} from './utils';

const createRangeTimestampsFactory =
    <T extends Record<any, any> = {}>(
        config: RangeTimestampsConfig,
        additionalContext: { [P in keyof T]: TypedPropertyDescriptor<T[P]> } = EMPTY_OBJECT
    ) =>
    () => {
        const nowDescriptor = getter(() => NOW);
        const configContext = struct({ now: nowDescriptor }) as RangeTimestampsConfigContext;
        const unwrap = getRangeTimestampsConfigParameterUnwrapper(config, configContext);

        let { from, to, now: NOW } = EMPTY_OBJECT as RangeTimestamps;

        const nowSetter = (timestamp?: RangeTimestamp | null) => {
            NOW = parseRangeTimestamp(timestamp as RangeTimestamp) ?? NOW;

            parsing: {
                if (isRangeTimestampsConfigWithoutOffset(config)) {
                    from = parseRangeTimestamp(unwrap(config.from)) ?? NOW;
                    to = parseRangeTimestamp(unwrap(config.to)) ?? NOW;
                    break parsing;
                }

                let date: Date;
                let direction: 1 | -1;
                let withRangeFrom: boolean;

                if ((withRangeFrom = isRangeTimestampsConfigWithFromOffset(config))) {
                    date = new Date((from = parseRangeTimestamp(unwrap(config.from)) ?? NOW));
                    direction = 1;
                } else {
                    date = new Date((to = parseRangeTimestamp(unwrap(config.to)) ?? NOW));
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

                withRangeFrom ? (to = parseRangeTimestamp(date.getTime()) ?? NOW) : (from = parseRangeTimestamp(date.getTime()) ?? NOW);
            }

            if (from > to) [from, to] = [to, from];
        };

        nowSetter(Date.now());

        return struct({
            ...additionalContext,
            from: getter(() => from),
            to: getter(() => to),
            now: { ...nowDescriptor, set: nowSetter },
        }) as RangeTimestamps<T>;
    };

export default createRangeTimestampsFactory;
