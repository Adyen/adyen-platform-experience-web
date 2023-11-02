export type MemoComparator = {
    <T = {}>(getters?: MemoComparatorGetters<T>): MemoComparatorCallback<T>;
    exclude: () => void;
};

export type MemoComparatorCallback<T = {}> = (prev: T, next: T) => boolean;

export type MemoComparatorGetters<T = {}> = {
    [K in keyof T]?: (value?: T[K]) => any;
} & {};
