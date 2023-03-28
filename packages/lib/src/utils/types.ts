export type ValueOf<T> = T[keyof T];
export function isNotUndefinedArray<T>(a_arr: Array<T | undefined>): a_arr is Array<T> {
    return !a_arr.some(a_item => a_item === undefined);
}
