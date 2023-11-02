export * from './constants';
import { $createObject, immutableProxyHandlers } from './constants';

export const call = Function.prototype.bind.bind(Function.prototype.call);
export const struct = call($createObject, null, null);
export const structFrom = call($createObject, null);
export const toString = call(Object.prototype.toString);

export const noop = new Proxy(() => {}, immutableProxyHandlers);
export const enumerable = (value: any) => ({ value, enumerable: true } as const);

export const identity = <T = any>(value?: T) => value;
export const boolify = (value?: any, fallbackBoolean?: boolean) => (typeof value === 'boolean' ? value : !!fallbackBoolean);
export const clamp = (min: number, value: number, max: number) => Math.max(min, Math.min(value, max));
export const mid = (low: number, high: number) => low + Math.floor((high - low) / 2);
export const mod = (value: number, modulo: number) => ((value % modulo) + modulo) % modulo;
export const isFunction = (value: any): value is (...args: any[]) => any => typeof value === 'function';
export const isNumber = (value: any): value is number => typeof value === 'number';
export const isInfinite = (value: any): value is number => isNumber(value) && 1 / value === 0;
export const isBitSafeInteger = (value: any): value is number => isNumber(value) && value === ~~value;

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
