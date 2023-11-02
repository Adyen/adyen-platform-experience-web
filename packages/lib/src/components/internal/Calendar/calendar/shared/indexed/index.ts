import { Indexed, IndexedMapIteratorCallback, IndexedMapIteratorFactory } from './types';
import { isFunction, isNumber, struct, structFrom } from '@src/utils/common';
import { $true } from '@src/utils/common/constants';
import { isString } from '@src/utils/validator-utils';

const indexed = (() => {
    const mapIteratorFactory: IndexedMapIteratorFactory = function* (callback = (x: any) => x, thisArg: any) {
        for (let i = 0; i < this.length; i++) {
            yield callback.call(thisArg, this[i], i, this);
        }
    };

    const IterablePrototype = Object.freeze(
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
        })
    );

    const ProxyGetTrap =
        <V>(getter: (index: number) => V) =>
        (target: Indexed<V>, property: string | symbol, receiver: any) => {
            if (isString(property)) {
                const index = +property;
                if (index >= 0 && index < target.length) {
                    return getter(index);
                }
            }
            return Reflect.get(target, property, receiver);
        };

    return <V, T = {}>(
        iterablePropertyDescriptorsOrSize: PropertyDescriptorMap | (() => number) | number,
        iteratorValueGetter: (index: number) => V
    ): Indexed<V> & T => {
        if (isFunction(iterablePropertyDescriptorsOrSize)) {
            return indexed<V, T>(
                {
                    length: { get: iterablePropertyDescriptorsOrSize },
                },
                iteratorValueGetter
            );
        }

        if (isNumber(iterablePropertyDescriptorsOrSize)) {
            return indexed<V, T>(
                {
                    length: { value: iterablePropertyDescriptorsOrSize },
                },
                iteratorValueGetter
            );
        }

        return new Proxy(structFrom(IterablePrototype, iterablePropertyDescriptorsOrSize), {
            get: ProxyGetTrap(iteratorValueGetter),
            set: $true,
        }) as Indexed<V> & T;
    };
})();

export default indexed;
