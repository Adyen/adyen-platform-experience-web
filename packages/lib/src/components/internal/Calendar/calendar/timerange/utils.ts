import { clamp, EMPTY_OBJECT, enumerable, hasOwnProperty, isBitSafeInteger, isFunction, struct, toString } from '@src/utils/common';
import type { WeekDay } from '../types';
import type {
    RangeTimestamp,
    RangeTimestampOffsets,
    RangeTimestamps,
    RangeTimestampsConfig,
    RangeTimestampsConfigContext,
    RangeTimestampsConfigParameter,
    RangeTimestampsConfigParameterValue,
    RangeTimestampsConfigRestampingContext,
    RangeTimestampsConfigWithFromOffsets,
    RangeTimestampsConfigWithoutOffsets,
} from './types';
import { Restamper, RestamperWithTimezone, systemToTimezone, timezoneToSystem } from '@src/core/Localization/datetime/restamper';

export const asPlainObject = <T = any>(value: T): T extends Record<any, any> ? T : Readonly<{}> =>
    toString(value).slice(8, -1) === 'Object' ? value : EMPTY_OBJECT;

export const getter = <T = any>(get: () => T, enumerable = true): TypedPropertyDescriptor<T> =>
    ({
        enumerable: (enumerable as any) !== false,
        get,
    } as const);

export const createRangeTimestampsConfigRestampingContext = (restamper: RestamperWithTimezone) =>
    Object.freeze({
        systemToTimezone: enumerable((time?: Parameters<Restamper>[0]) => systemToTimezone(restamper, time)),
        timezoneToSystem: enumerable((time?: Parameters<Restamper>[0]) => timezoneToSystem(restamper, time)),
        timezoneOffset: enumerable((time?: Parameters<Restamper>[0]) => restamper(time).offset),
    }) as { [P in keyof RangeTimestampsConfigRestampingContext]: TypedPropertyDescriptor<RangeTimestampsConfigRestampingContext[P]> };

export const getRangeTimestampsContextIntegerPropertyFactory = <T extends number = number>(
    minInteger: T,
    maxInteger: T,
    defaultInteger: T = minInteger
) => {
    const _getNormalizedValue = (value?: T | null, fallbackValue?: T) => {
        let normalizedValue = value as T;

        if (value == undefined) normalizedValue = defaultInteger;
        else if (!isBitSafeInteger(value)) normalizedValue = fallbackValue ?? defaultInteger;

        const clampedValue = clamp(minInteger, normalizedValue, maxInteger) as T;
        return clampedValue === normalizedValue ? clampedValue : fallbackValue ?? defaultInteger;
    };

    return (initialValue?: T) => {
        const valueGetter = getter(() => normalizedValue);
        let normalizedValue = _getNormalizedValue(initialValue);

        return struct({
            value: valueGetter,
            descriptor: enumerable({
                ...valueGetter,
                set(this: RangeTimestamps, value?: T | null) {
                    const currentValue = normalizedValue;
                    normalizedValue = _getNormalizedValue(value, normalizedValue);
                    if (currentValue !== normalizedValue) this.now = this.now;
                },
            }),
        }) as Readonly<{
            value: T;
            descriptor: TypedPropertyDescriptor<T>;
        }>;
    };
};

export const getRangeTimestampsConfigParameterUnwrapper =
    (config: RangeTimestampsConfig, context: RangeTimestampsConfigContext) =>
    <T = {}>(value: T): RangeTimestampsConfigParameterValue<T> =>
        isFunction(value) ? value.call(config, context) : value;

export const isRangeTimestampsConfigWithoutOffsets = (config: RangeTimestampsConfig): config is RangeTimestampsConfigWithoutOffsets =>
    !hasOwnProperty(config, 'offsets');

export const isRangeTimestampsConfigWithFromOffsets = (
    config: Exclude<RangeTimestampsConfig, RangeTimestampsConfigWithoutOffsets>
): config is RangeTimestampsConfigWithFromOffsets => hasOwnProperty(config, 'from');

export const nowTimestamp = (({ now }) => now) satisfies RangeTimestampsConfigParameter<RangeTimestamp>;

export const offsetsForNDays = (() => {
    const _cache = new Map<number, RangeTimestampOffsets>();

    return (numberOfDays: number) => {
        let offsets = _cache.get(numberOfDays);

        if (offsets === undefined) {
            offsets = Object.freeze([0, 0, numberOfDays, 0, 0, 0, -1] as const);
            _cache.set(numberOfDays, offsets);
        }

        return offsets;
    };
})();

export const parseRangeTimestamp = (timestamp: Date | RangeTimestamp): RangeTimestamp | undefined => {
    try {
        const normalizedTimestamp = timestamp instanceof Date || +timestamp === timestamp ? timestamp : undefined;
        const parsedTimestamp = new Date(normalizedTimestamp as RangeTimestamp).getTime();
        return isNaN(parsedTimestamp) ? undefined : parsedTimestamp;
    } catch {
        /* ignore any parsing exception and implicitly return `undefined` */
    }
};

export const startOfDay = (date: Date) => date.setHours(0, 0, 0, 0);

export const startOfMonth = (date: Date) => {
    startOfDay(date);
    return date.setDate(1);
};

export const startOfYear = (date: Date) => {
    startOfDay(date);
    return date.setMonth(0, 1);
};

export const startOfWeekOffset = (firstWeekDay: WeekDay, weekDay: WeekDay = firstWeekDay) => {
    const offset = (((-weekDay % 7) + (firstWeekDay - 7)) % 7) as 0 | -1 | -2 | -3 | -4 | -5 | -6;
    return 0 + offset; // {0 + expression} => corrects -0 to 0
};
