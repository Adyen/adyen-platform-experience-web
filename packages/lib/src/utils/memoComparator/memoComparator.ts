import { identity, isFunction, noop, sameValue } from '@src/utils/common';
import { MemoComparator, MemoComparatorGetters } from './types';

const memoComparator = (() => {
    const comparator = (<T = {}>(getters?: MemoComparatorGetters<T>) =>
        (prev: T, next: T) => {
            for (const key in prev) {
                let getter = getters?.[key];
                getter = isFunction(getter) ? getter : identity;
                if (!sameValue(getter(prev[key]), getter(next[key]))) return false;
            }
            return true;
        }) as MemoComparator;

    return Object.defineProperty(comparator, 'exclude', { value: noop });
})();

export default memoComparator;
