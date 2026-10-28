const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype;

const isEqual = (a: unknown, b: unknown): boolean => {
    if (Object.is(a, b)) return true;
    if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((item, index) => isEqual(item, b[index]));
    if (!isPlainObject(a) || !isPlainObject(b)) return false;

    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...keys].every(key => isEqual(a[key], b[key]));
};

export const getChanges = (prev: object, next: object): Record<string, unknown> => {
    const before = prev as Record<string, unknown>;
    const after = next as Record<string, unknown>;
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

    return Object.fromEntries([...keys].filter(key => !isEqual(before[key], after[key])).map(key => [key, after[key]]));
};
