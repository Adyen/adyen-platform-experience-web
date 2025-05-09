import { fn } from '../common';
import { EMPTY_OBJECT } from '../value/constants';
import { truthify } from '../value/bool';
import { isPlainObject } from '../value/is';
import type { PredicateType } from '../types';

type _PlainObject<T> = PredicateType<typeof isPlainObject<T>>;

export const asPlainObject = <T>(value?: T, fallback = EMPTY_OBJECT as _PlainObject<T>): _PlainObject<T> =>
    isPlainObject(value) ? value : asPlainObject(fallback, EMPTY_OBJECT as _PlainObject<T>);

interface _StructFrom {
    <T extends Record<any, any>, P extends object | null>(o: P, properties: { [K in keyof T]: TypedPropertyDescriptor<T[K]> }): P extends object
        ? Omit<P, keyof T> & T
        : T;
    <P extends object | null>(o: P): P extends object ? { [K in keyof P]: P[K] } : Record<any, any>;
}

interface _Struct {
    <T extends Record<any, any>>(properties: { [K in keyof T]: TypedPropertyDescriptor<T[K]> }): T;
    (): Record<any, any>;
}

export const structFrom = fn(Object.create, void 0) as _StructFrom;
export const struct: _Struct = fn(structFrom, void 0, null);

export const withFreezeProxyHandlers = <T extends object>(handler: ProxyHandler<T> = EMPTY_OBJECT): Readonly<ProxyHandler<T>> => {
    return Object.freeze({ ...handler, defineProperty: truthify, set: truthify } as const);
};
