/**
 * Compares two values using [`SameValueZero`](https://tc39.es/ecma262/multipage/abstract-operations.html#sec-samevaluezero) comparison and returns `true` if they are the same, or `false` otherwise.
 * The comparison is very similar to strict equality comparison but also returns `true` if both values are `NaN`.
 */
export const sameValue = (a: any, b: any) => a === b || !(a === a || b === b);
