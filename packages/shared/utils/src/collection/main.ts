import { fn, identity } from '../common';
import { EMPTY_ARRAY } from '../value/constants';
import { isFunction, isNullish, isUndefined } from '../value/is';
import type { MapGetter } from './types';

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
    const stringedList = (
        stringedValue
            ? stringedValue
                  .split(',')
                  .map(s => s.trim())
                  .filter(identity)
            : EMPTY_ARRAY
    ) as T[];
    return stringedList.length ? stringedList : fallbackList;
};

export const pickFrom = <C extends readonly any[] | any[]>(list: C, option?: C[number], defaultOption?: C[number]) => {
    if (list.includes(option)) {
        return option;
    }
    if (isNullish(option)) {
        return list[0];
    }
    return list.includes(defaultOption) ? defaultOption : list[0];
};

export const some = fn(Array.prototype.some);
