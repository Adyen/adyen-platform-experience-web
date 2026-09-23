/**
 * Compares two values using [`SameValueZero`](https://tc39.es/ecma262/multipage/abstract-operations.html#sec-samevaluezero) comparison and returns `true` if they are the same, or `false` otherwise.
 * The comparison is very similar to strict equality comparison but also returns `true` if both values are `NaN`.
 */
export const sameValue = (a: any, b: any) => a === b || !(a === a || b === b);

/**
 * Compares the own enumerable properties of two objects using SameValueZero comparison.
 * Nested objects are compared by reference and are not traversed.
 */
export const isShallowEqual = <T extends object>(a: T | null | undefined, b: T | null | undefined): boolean => {
    if (a === b) return true;
    if (a == null || b == null) return false;

    const keysA = Object.keys(a);
    if (keysA.length !== Object.keys(b).length) return false;

    return keysA.every(key => Object.prototype.hasOwnProperty.call(b, key) && sameValue(a[key as keyof T], b[key as keyof T]));
};
