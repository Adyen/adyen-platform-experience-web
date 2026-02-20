import { hasOwnProperty } from '../../../utils';

export const getCachedValue = <T extends Record<string, any>, K extends keyof T>(
    cache: Readonly<T> | undefined,
    key: K,
    fallback: T[K] | Readonly<T[K]> | undefined
) => {
    return cache ? cache[key] : fallback;
};

// prettier-ignore
export const hasCacheStructureChanged = <T extends Record<string, any>, K extends keyof T>(
    cache: Readonly<T> | undefined,
    keys: K[],
) => {
    if (!cache || Object.keys(cache).length !== keys.length) return true;
    for (const key of keys) {
        if (!hasOwnProperty(cache, key)) return true;
    }
    return false;
};
