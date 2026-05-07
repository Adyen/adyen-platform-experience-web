export type MemoComparator = {
    <T = Record<string, unknown>>(getters?: MemoComparatorGetters<T>): MemoComparatorCallback<T>;
    exclude: () => void;
};

export type MemoComparatorCallback<T = Record<string, unknown>> = (prev: T, next: T) => boolean;

export type MemoComparatorGetters<T = Record<string, unknown>> = {
    [K in MemoComparatorProp<T>]?: (value?: T[K]) => any;
} & {};

export type MemoComparatorProp<T = Record<string, unknown>> = Extract<keyof T, string>;
