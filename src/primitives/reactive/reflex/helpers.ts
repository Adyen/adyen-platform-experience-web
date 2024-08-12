import { REF } from './constants';
import { MissingReflexActionError } from './errors';
import type { Ref, Reflex, Reflexable, ReflexAction } from './types';
import { EMPTY_OBJECT, hasOwnProperty, isFunction, isUndefined, sameValue } from '../../../utils';

export function assertReflexAction<T = any>(value?: any): asserts value is ReflexAction<T> {
    if (!isFunction(value)) throw new MissingReflexActionError();
}

export const isReflex = <T = any>(value: any): value is Reflex<T> => {
    try {
        if (isFunction(value) && hasOwnProperty(value, 'current') && hasOwnProperty(value, REF) && !sameValue(value, (value as Reflex<T>)[REF])) {
            const notDefined = (value as Reflex<T>).actions.get(EMPTY_OBJECT as ReflexAction<T>);
            const size = (value as Reflex<T>).actions.size;
            return isUndefined(notDefined) && Number.isInteger(size) && size >= 0;
        }
    } catch {
        /* Definitely not a reflex, return false outside this block */
    }

    return false;
};

export const unwrap = <T = any>(reflexable: Reflexable<T>): Ref<T> => (isReflex<T>(reflexable) ? unwrap(reflexable[REF]) : reflexable);
