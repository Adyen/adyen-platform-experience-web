import { $createObject, immutableProxyHandlers } from './constants';

export const call = Function.prototype.bind.bind(Function.prototype.call);
export const struct = call($createObject, null, null);
export const structFrom = call($createObject, null);
export const toString = call(Object.prototype.toString);

export const noop = new Proxy(() => {}, immutableProxyHandlers);
export const enumerable = (value: any) => ({ value, enumerable: true } as const);

export const boolify = (value?: any, fallbackBoolean?: boolean) => (typeof value === 'boolean' ? value : !!fallbackBoolean);
export const clamp = (min: number, value: number, max: number) => Math.max(min, Math.min(value, max));
export const mid = (low: number, high: number) => low + Math.floor((high - low) / 2);
export const mod = (value: number, mod: number) => ((value % mod) + mod) % mod;
export const isNumber = (value: any): value is number => typeof value === 'number';
export const isInfinite = (value: any): value is number => isNumber(value) && 1 / value === 0;
export const isBitSafeInteger = (value: any): value is number => isNumber(value) && value === ~~value;

export const pickFromCollection = <C extends readonly any[]>(collection: C, option?: C[number], defaultOption?: C[number]) => {
    if (collection.includes(option)) return option;
    if (option == undefined) return collection[0];
    return collection.includes(defaultOption) ? defaultOption : collection[0];
};
