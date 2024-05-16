import { identity, isString } from '../../utils';
import type { Indexed, IndexedMapIteratorFactory } from './types';

export const indexedProxyGetTrap =
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

export const mapIteratorFactory: IndexedMapIteratorFactory = function* (callback = identity, thisArg: any) {
    for (let i = 0; i < this.length; i++) {
        yield callback.call(thisArg, this[i], i, this);
    }
};
