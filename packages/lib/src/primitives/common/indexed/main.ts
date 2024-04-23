import { isFunction, isNumber, struct, structFrom, truthify } from '@src/utils/common';
import { indexedProxyGetTrap, mapIteratorFactory } from './helpers';
import type { Indexed, IndexedMapIteratorCallback } from './types';

const __INDEXED_PROTO__ = Object.freeze(
    struct({
        [Symbol.iterator]: {
            value(this: Indexed) {
                return mapIteratorFactory.call(this);
            },
        },
        map: {
            value(this: Indexed, callback?: IndexedMapIteratorCallback, thisArg?: any) {
                return [...mapIteratorFactory.call(this, callback, thisArg)];
            },
        },
    }) as Readonly<{
        [Symbol.iterator]: (this: Indexed) => Generator<any>;
        map: Indexed['map'];
    }>
);

export const createIndexed = <T extends Record<any, any> = {}, V = any>(
    iterablePropertyDescriptorsOrSize: PropertyDescriptorMap | (() => number) | number,
    iteratorValueGetter: (index: number) => V
): Indexed<V> & T => {
    if (isFunction(iterablePropertyDescriptorsOrSize)) {
        return createIndexed<T, V>(
            {
                length: { get: iterablePropertyDescriptorsOrSize },
            },
            iteratorValueGetter
        );
    }

    if (isNumber(iterablePropertyDescriptorsOrSize)) {
        return createIndexed<T, V>(
            {
                length: { value: iterablePropertyDescriptorsOrSize },
            },
            iteratorValueGetter
        );
    }

    return new Proxy(structFrom(__INDEXED_PROTO__, iterablePropertyDescriptorsOrSize), {
        get: indexedProxyGetTrap(iteratorValueGetter),
        set: truthify,
    }) as Indexed<V> & T;
};

export default createIndexed;
