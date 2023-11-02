export type MemoComparator = {
    <T = {}>(getters?: MemoComparatorGetters<T>): MemoComparatorCallback<T>;
    exclude: () => void;
};

export type MemoComparatorCallback<T = {}> = (prev: T, next: T) => boolean;

export type MemoComparatorGetters<T = {}> = {
    [K in MemoComparatorProp<T>]?: (value?: T[K]) => any;
} & {};

export type MemoComparatorProp<T = {}> = Extract<keyof T, string>;
