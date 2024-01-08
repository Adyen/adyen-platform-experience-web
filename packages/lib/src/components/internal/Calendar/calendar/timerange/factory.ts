import { EMPTY_OBJECT, struct } from '@src/utils/common';
import type { RangeTimestamp, RangeTimestamps, RangeTimestampsConfig, RangeTimestampsConfigContext } from './types';
import {
    asPlainObject,
    getter,
    getRangeTimestampsConfigParameterUnwrapper,
    isRangeTimestampsConfigWithFromOffset,
    isRangeTimestampsConfigWithoutOffset,
    parseRangeTimestamp,
} from './utils';

const createRangeTimestampsFactory = <T extends Record<any, any> = {}>(
    config: RangeTimestampsConfig = EMPTY_OBJECT,
    additionalContext: { [P in keyof T]: TypedPropertyDescriptor<T[P]> } = EMPTY_OBJECT
) => {
    const _config = asPlainObject(config);
    const _additionalContext = asPlainObject(additionalContext);

    return () => {
        const nowDescriptor = getter(() => NOW);
        const configContext = struct({ now: nowDescriptor }) as RangeTimestampsConfigContext;
        const unwrap = getRangeTimestampsConfigParameterUnwrapper(_config, configContext);

        let { from, to, now: NOW } = EMPTY_OBJECT as RangeTimestamps;

        const nowSetter = (timestamp?: RangeTimestamp | null) => {
            NOW = parseRangeTimestamp((timestamp ?? Date.now()) as RangeTimestamp) ?? NOW;

            parsing: {
                if (isRangeTimestampsConfigWithoutOffset(_config)) {
                    from = parseRangeTimestamp(unwrap(_config.from)) ?? NOW;
                    to = parseRangeTimestamp(unwrap(_config.to)) ?? NOW;
                    break parsing;
                }

                let date: Date;
                let direction: 1 | -1;
                let withRangeFrom: boolean;

                if ((withRangeFrom = isRangeTimestampsConfigWithFromOffset(_config))) {
                    date = new Date((from = parseRangeTimestamp(unwrap(_config.from)) ?? NOW));
                    direction = 1;
                } else {
                    date = new Date((to = parseRangeTimestamp(unwrap(_config.to)) ?? NOW));
                    direction = -1;
                }

                const [years = 0, months = 0, days = 0, hours = 0, minutes = 0, seconds = 0, ms = 0] = unwrap(_config.offset);

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

        nowSetter();

        return struct({
            ..._additionalContext,
            from: getter(() => from),
            to: getter(() => to),
            now: { ...nowDescriptor, set: nowSetter },
        }) as RangeTimestamps<Omit<T, keyof RangeTimestamps>>;
    };
};

export default createRangeTimestampsFactory;
