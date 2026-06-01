export interface Indexed<V = any> extends ArrayLike<V>, Iterable<V> {
    map: (
        this: Indexed<V>,
        ...args: Parameters<IndexedMapIteratorFactory<V>>
    ) => ReturnType<IndexedMapIteratorFactory<V>> extends Generator<infer MappedValue> ? MappedValue[] : never;
}

export type IndexedMapIteratorCallback<V = any, MappedValue = any> = {
    (item: Indexed<V>[number], index: number, context: Indexed<V>): MappedValue;
};

export type IndexedMapIteratorFactory<V = any, MappedValue = any> = {
    (this: Indexed<V>, callback?: IndexedMapIteratorCallback<V, MappedValue>, thisArg?: any): Generator<MappedValue>;
};
