export interface Indexed<V = any> extends ArrayLike<V>, Iterable<V> {
    map: IndexedMapIteratorFactory<V>;
}

export type IndexedMapIteratorCallback<V = any, MappedValue = any> = {
    (item: Indexed<V>[number], index: number, context: Indexed<V>): MappedValue;
};

export type IndexedMapIteratorFactory<V = any, MappedValue = any> = {
    (this: Indexed<V>, callback?: IndexedMapIteratorCallback<V, MappedValue>, thisArg?: any): Generator<MappedValue>;
};
