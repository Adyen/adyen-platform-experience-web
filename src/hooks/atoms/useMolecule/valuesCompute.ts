import type { WithValue } from '../shared/types';
import { hasOwnProperty } from '../../../utils';

export const createValuesComputeFn = <T extends Record<string, any>>() => {
    let cachedLatestValue: Readonly<T> | undefined = undefined;
    let cachedUsedValue: Readonly<T> | undefined = undefined;

    const getCachedLatestValue = (key: keyof T, fallbackValue: T[keyof T] | Readonly<T[keyof T]>) => {
        return cachedLatestValue ? cachedLatestValue[key] : fallbackValue;
    };

    const getCachedUsedValue = (key: keyof T, fallbackValue: T[keyof T] | Readonly<T[keyof T]>) => {
        return cachedUsedValue ? cachedUsedValue[key] : fallbackValue;
    };

    const hasStructureChanged = (cachedValue: Readonly<T> | undefined, keys: (keyof T)[]) => {
        if (!cachedValue || Object.keys(cachedValue).length !== keys.length) return true;
        for (const key of keys) {
            if (!hasOwnProperty(cachedValue, key)) return true;
        }
        return false;
    };

    return (keys: (keyof T)[], members: { [K in keyof T]: WithValue<T[K] | Readonly<T[K]>> }) => {
        const latestValue = {} as T;
        const usedValue = {} as T;

        let latestValueChanged = false;
        let usedValueChanged = false;

        keys.forEach(key => {
            const { value, $value } = members[key];

            latestValueChanged ||= $value !== getCachedLatestValue(key, $value);
            usedValueChanged ||= value !== getCachedUsedValue(key, value);

            latestValue[key] = $value as T[keyof T];
            usedValue[key] = value as T[keyof T];
        });

        if (hasStructureChanged(cachedLatestValue, keys)) {
            latestValueChanged = true;
        }

        if (hasStructureChanged(cachedUsedValue, keys)) {
            usedValueChanged = true;
        }

        if (!cachedLatestValue || latestValueChanged) {
            cachedLatestValue = latestValue as Readonly<T>;
        }

        if (!cachedUsedValue || usedValueChanged) {
            cachedUsedValue = usedValue as Readonly<T>;
        }

        return {
            latestValue: cachedLatestValue,
            usedValue: cachedUsedValue,
        } as const;
    };
};
