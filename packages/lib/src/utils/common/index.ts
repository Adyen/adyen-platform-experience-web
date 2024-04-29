export * from './constants';
import { JSXInternal } from 'preact/src/jsx';
import { $createObject, immutableProxyHandlers } from './constants';

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

export const identity = <T = any>(value?: T) => value;
export const boolify = (value?: any, fallbackBoolean?: boolean) => (typeof value === 'boolean' ? value : !!fallbackBoolean);
export const clamp = <T extends number = number>(min: T, value: T, max: T) => Math.max(min as number, Math.min(value as number, max as number));
export const mid = (low: number, high: number) => low + Math.floor((high - low) / 2);
export const mod = (value: number, modulo: number) => ((value % modulo) + modulo) % modulo;
export const isFunction = (value: any): value is (...args: any[]) => any => typeof value === 'function';
export const isNumber = (value: any): value is number => typeof value === 'number';
export const isInfinite = (value: any): value is number => isNumber(value) && 1 / value === 0;
export const isBitSafeInteger = (value: any): value is number => isNumber(value) && value === ~~value;

export const capitalize = (str?: string) => (str && str.length > 0 ? `${str[0]!.toUpperCase()}${str.slice(1)}` : str);

/**
 * Compares two values using [`SameValueZero`](https://tc39.es/ecma262/multipage/abstract-operations.html#sec-samevaluezero) comparison and returns `true` if they are the same, or `false` otherwise.
 * The comparison is very similar to strict equality comparison but also returns `true` if both values are `NaN`.
 */
export const sameValue = (a: any, b: any) => a === b || !(a === a || b === b);

export const pickFromCollection = <C extends readonly any[]>(collection: C, option?: C[number], defaultOption?: C[number]) => {
    if (collection.includes(option)) return option;
    if (option == undefined) return collection[0];
    return collection.includes(defaultOption) ? defaultOption : collection[0];
};
export const parseBoolean = (value: boolean | JSXInternal.SignalLike<boolean | undefined> | undefined): boolean =>
    value && typeof value !== 'boolean' && value?.value ? !!value?.value : !!value;
