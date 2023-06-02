import { List, Reference } from './types';

const uniqueFlatten = <T, R>(
    uniqueItems: Set<T>,
    items: List<T>,
    flattenCallback: (flattenResult: R | undefined, item: T) => R | undefined,
    flattenResult?: R
) => {
    for (const item of items) {
        if (Array.isArray(item)) {
            flattenResult = uniqueFlatten(uniqueItems, item, flattenCallback, flattenResult);
        } else if (!uniqueItems.has(item)) {
            uniqueItems.add(item);
            flattenResult = flattenCallback(flattenResult, item);
        }
    }

    return flattenResult;
};

export const flatten = (() => {
    const flattenCallback = (id: string | undefined, ref: Reference<any>) => {
        const elemId = ref?.current instanceof Element ? ref.current.id : '';
        return elemId ? (id ? `${id} ${elemId}` : elemId) : id ?? '';
    };

    return (...refs: List<Reference<any>>) => uniqueFlatten(new Set<Reference<any>>(), refs, flattenCallback) || '';
})();
