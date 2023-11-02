import { identity, isFunction, noop, sameValue } from '@src/utils/common';
import { MemoComparator, MemoComparatorGetters, MemoComparatorProp } from './types';

const memoComparator = (() => {
    const _comparedProps = new Set<string>();

    const _propHasChanged = <T = {}>(prev: T, next: T, prop: MemoComparatorProp<T>, getters?: MemoComparatorGetters<T>) => {
        let getter = getters?.[prop];
        getter = isFunction(getter) ? getter : identity;
        return !sameValue(getter(prev[prop]), getter(next[prop]));
    };

    const comparator = (<T = {}>(getters?: MemoComparatorGetters<T>) =>
        (prev: T, next: T) => {
            try {
                for (const prop in prev) {
                    _comparedProps.add(prop);
                    if (_propHasChanged(prev, next, prop, getters)) return false;
                }

                for (const prop in next) {
                    if (_comparedProps.has(prop)) continue;
                    _comparedProps.add(prop);
                    if (_propHasChanged(prev, next, prop, getters)) return false;
                }

                return true;
            } finally {
                _comparedProps.clear();
            }
        }) as MemoComparator;

    return Object.defineProperty(comparator, 'exclude', { value: noop });
})();

export default memoComparator;
