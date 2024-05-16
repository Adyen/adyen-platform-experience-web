import { fn, identity } from '../common';
import { EMPTY_ARRAY } from '../value/constants';
import { isFunction, isNullish, isUndefined } from '../value/is';
import type { List, MapGetter } from './types';

export const getMappedValue: MapGetter = (key, map, factory) => {
    let value = map.get(key);

    if (isUndefined(value) && isFunction(factory)) {
        if (!isUndefined((value = factory(key, map)))) {
            map.set(key, value);
        }
    }

    return value;
};

export const listFrom = <T extends string = string>(value?: string | any[], fallbackList = EMPTY_ARRAY as unknown as T[]) => {
    const stringedValue = `${value || ''}`.trim();
    const stringedList = (stringedValue ? stringedValue.split(/(?:\s*,\s*)+/).filter(identity) : EMPTY_ARRAY) as T[];
    return stringedList.length ? stringedList : fallbackList;
};

export const pickFrom = <C extends readonly any[] | any[]>(list: C, option?: C[number], defaultOption?: C[number]) => {
    if (list.includes(option)) return option;
    if (isNullish(option)) return list[0];
    return list.includes(defaultOption) ? defaultOption : list[0];
};

export const some = fn(Array.prototype.some);

const _uniqueFlatten = function _uniqueFlatten<T>(reversed: boolean, items: List<T>, uniqueItems: Set<T> = new Set<T>()) {
    for (const item of items) {
        if (!Array.isArray(item)) {
            reversed && uniqueItems.delete(item);
            uniqueItems.add(item);
        } else _uniqueFlatten(reversed, item, uniqueItems);
    }
    return uniqueItems;
};

type _UniqueFlatten = <T>(items: List<T>, uniqueItems?: Set<T>) => Set<T>;

export const uniqueFlatten = fn(_uniqueFlatten, void 0, false) as _UniqueFlatten;
export const uniqueFlattenReversed = fn(_uniqueFlatten, void 0, true) as _UniqueFlatten;
