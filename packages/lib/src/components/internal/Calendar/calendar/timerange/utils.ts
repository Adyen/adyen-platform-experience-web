import { clamp, EMPTY_OBJECT, enumerable, hasOwnProperty, isBitSafeInteger, isFunction, struct, toString } from '@src/utils/common';
import type {
    RangeTimestamp,
    RangeTimestampOffset,
    RangeTimestamps,
    RangeTimestampsConfig,
    RangeTimestampsConfigContext,
    RangeTimestampsConfigParameter,
    RangeTimestampsConfigParameterValue,
    RangeTimestampsConfigWithFromOffset,
    RangeTimestampsConfigWithoutOffset,
} from './types';

export const asPlainObject = (value: any) => (toString(value).slice(8, -1) === 'Object' ? value : EMPTY_OBJECT);

export const getter = <T extends any = any>(get: () => T, enumerable: boolean = true): TypedPropertyDescriptor<T> =>
    ({
        enumerable: (enumerable as any) !== false,
        get,
    } as const);

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

export const isRangeTimestampsConfigWithoutOffset = (config: RangeTimestampsConfig): config is RangeTimestampsConfigWithoutOffset =>
    !hasOwnProperty(config, 'offset');

export const isRangeTimestampsConfigWithFromOffset = (
    config: Exclude<RangeTimestampsConfig, RangeTimestampsConfigWithoutOffset>
): config is RangeTimestampsConfigWithFromOffset => hasOwnProperty(config, 'from');

export const nowTimestamp = (({ now }) => now) satisfies RangeTimestampsConfigParameter<RangeTimestamp>;

export const offsetForNDays = (() => {
    const _cache = new Map<number, RangeTimestampOffset>();

    return (numberOfDays: number) => {
        let offset = _cache.get(numberOfDays);

        if (offset === undefined) {
            offset = Object.freeze([0, 0, numberOfDays, 0, 0, 0, -1] as const);
            _cache.set(numberOfDays, offset);
        }

        return offset;
    };
})();

export const parseRangeTimestamp = (timestamp: RangeTimestamp): RangeTimestamp | undefined => {
    try {
        const normalizedTimestamp = +timestamp === timestamp ? timestamp : undefined;
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
