import { asPlainObject, EMPTY_OBJECT, getter, struct } from '../../../../../utils';
import restamper, { RestamperWithTimezone } from '../../../../../core/Localization/datetime/restamper';
import type { RangeTimestamp, RangeTimestamps, RangeTimestampsConfig, RangeTimestampsConfigContext } from './types';
import {
    createRangeTimestampsConfigRestampingContext,
    getRangeTimestampsConfigParameterUnwrapper,
    isRangeTimestampsConfigWithFromOffsets,
    isRangeTimestampsConfigWithoutOffsets,
    parseRangeTimestamp,
} from './utils';

const createRangeTimestampsFactory = <T extends Record<any, any> = {}>(
    config: RangeTimestampsConfig = EMPTY_OBJECT as RangeTimestampsConfig,
    additionalContext: { [P in keyof T]: TypedPropertyDescriptor<T[P]> } = EMPTY_OBJECT as { [P in keyof T]: TypedPropertyDescriptor<T[P]> }
) => {
    const _config = asPlainObject(config);
    const _additionalContext = asPlainObject(additionalContext);

    return () => {
        const _restamper = restamper();
        const nowDescriptor = getter(() => NOW);
        const tzDescriptor = getter(() => _restamper.tz.current);
        const configContext = struct({
            now: nowDescriptor,
            timezone: tzDescriptor,
            ...createRangeTimestampsConfigRestampingContext(_restamper),
        }) as RangeTimestampsConfigContext;
        const unwrap = getRangeTimestampsConfigParameterUnwrapper(_config, configContext);

        let { from, to, now: NOW } = EMPTY_OBJECT as RangeTimestamps;

        const nowSetter = (timestamp?: Date | RangeTimestamp | null) => {
            NOW = parseRangeTimestamp((timestamp ?? Date.now()) as RangeTimestamp) ?? NOW;

            parsing: {
                if (isRangeTimestampsConfigWithoutOffsets(_config)) {
                    from = parseRangeTimestamp(unwrap(_config.from)) ?? NOW;
                    to = parseRangeTimestamp(unwrap(_config.to)) ?? NOW;
                    break parsing;
                }

                let date: Date;
                let direction: 1 | -1;
                let withRangeFrom: boolean;

                if ((withRangeFrom = isRangeTimestampsConfigWithFromOffsets(_config))) {
                    date = new Date((from = parseRangeTimestamp(unwrap(_config.from)) ?? NOW));
                    direction = 1;
                } else {
                    date = new Date((to = parseRangeTimestamp(unwrap(_config.to)) ?? NOW));
                    direction = -1;
                }

                // revert timestamp to system timezone ahead of offset operations
                date = new Date(configContext.timezoneToSystem(date));

                const [years = 0, months = 0, days = 0, hours = 0, minutes = 0, seconds = 0, ms = 0] = unwrap(_config.offsets);

                date.setFullYear(date.getFullYear() + years * direction, date.getMonth() + months * direction, date.getDate() + days * direction);

                date.setHours(
                    date.getHours() + hours * direction,
                    date.getMinutes() + minutes * direction,
                    date.getSeconds() + seconds * direction,
                    date.getMilliseconds() + ms * direction
                );

                // restamp timestamp to current target timezone before update range
                const timestamp = parseRangeTimestamp(configContext.systemToTimezone(date)) ?? NOW;

                withRangeFrom ? (to = timestamp) : (from = timestamp);
            }

            if (from > to) [from, to] = [to, from];
        };

        const tzSetter = (timezone?: RestamperWithTimezone['tz']['current'] | null) => {
            const tz = _restamper.tz;
            const currentTimezone = tz.current;
            _restamper.tz = timezone;
            if (tz.current !== currentTimezone) nowSetter(NOW);
        };

        nowSetter();

        return struct<RangeTimestamps<T>>({
            ..._additionalContext,
            from: getter(() => from),
            now: { ...nowDescriptor, set: nowSetter },
            timezone: { ...tzDescriptor, set: tzSetter },
            to: getter(() => to),
        });
    };
};

export default createRangeTimestampsFactory;
