export * from './constants';
import { JSXInternal } from 'preact/src/jsx';
import { $createObject, EMPTY_OBJECT, immutableProxyHandlers } from './constants';
import type { GetterPropertyDescriptor, MapGetter } from './types';

export const call = Function.prototype.bind.bind(Function.prototype.call);
export const struct = call($createObject, void 0, null);
export const structFrom = call($createObject, void 0);
export const toString = call(Object.prototype.toString);
export const hasOwnProperty = call(Object.prototype.hasOwnProperty);

export const noop = new Proxy(() => {}, immutableProxyHandlers);
export const asyncNoop = async () => {};

export const enumerable = <T extends any = any>(value: T, writable: boolean = false): TypedPropertyDescriptor<T> =>
    ({
        writable: (writable as any) === true,
        enumerable: true,
        value,
    } as const);

export const getter = <T>(get: () => T, enumerable = true): GetterPropertyDescriptor<T> =>
    ({
        enumerable: (enumerable as any) !== false,
        get,
    } as const);

export const identity = <T>(value: T) => value;
export const truthify = (_?: unknown): true => true;
export const boolify = (value?: any, fallbackBoolean?: boolean) => (typeof value === 'boolean' ? value : !!fallbackBoolean);
export const clamp = <T extends number = number>(min: T, value: T, max: T) => Math.max(min as number, Math.min(value as number, max as number));
export const mid = (low: number, high: number) => low + Math.floor((high - low) / 2);
export const mod = (value: number, modulo: number) => ((value % modulo) + modulo) % modulo;
export const isFunction = <T extends (...args: any[]) => any>(value?: unknown): value is T => typeof value === 'function';
export const isString = (value?: any): value is string => typeof value === 'string';
export const isNumber = (value: any): value is number => typeof value === 'number';
export const isInfinite = (value: any): value is number => isNumber(value) && 1 / value === 0;
export const isBitSafeInteger = (value: any): value is number => isNumber(value) && value === ~~value;
export const isNullable = (value?: any): value is undefined | null => value == undefined;
export const isUndefined = (value?: any): value is undefined => value === undefined;
export const isPlainObject = <T extends Record<any, any>>(value?: unknown): value is T => toString(value).slice(8, -1) === 'Object';
export const asPlainObject = <T extends Record<any, any>>(value?: unknown) => (isPlainObject<T>(value) ? value : (EMPTY_OBJECT as T));

export const capitalize = (str?: string) => (str && str.length > 0 ? `${str[0]!.toUpperCase()}${str.slice(1)}` : str);

/**
 * Compares two values using [`SameValueZero`](https://tc39.es/ecma262/multipage/abstract-operations.html#sec-samevaluezero) comparison and returns `true` if they are the same, or `false` otherwise.
 * The comparison is very similar to strict equality comparison but also returns `true` if both values are `NaN`.
 */
export const sameValue = (a: any, b: any) => a === b || !(a === a || b === b);

export const getMappedValue: MapGetter = (key, map, factory) => {
    let value = map.get(key);

    if (isUndefined(value) && isFunction(factory)) {
        if (!isUndefined((value = factory(key, map)))) {
            map.set(key, value);
        }
    }

    return value;
};

export const pickFromCollection = <C extends readonly any[]>(collection: C, option?: C[number], defaultOption?: C[number]) => {
    if (collection.includes(option)) return option;
    if (option == undefined) return collection[0];
    return collection.includes(defaultOption) ? defaultOption : collection[0];
};
export const parseBoolean = (value: boolean | JSXInternal.SignalLike<boolean | undefined> | undefined): boolean =>
    value && typeof value !== 'boolean' && value?.value ? !!value?.value : !!value;

export const parseTimestamp = (value?: Date | number | string): number | undefined => {
    const timestamp = (
        value instanceof Date ? value : new Date((isString(value) || Number.isFinite(value as number) ? value : undefined)!)
    ).getTime();

    return Number.isFinite(timestamp) ? timestamp : undefined;
};
