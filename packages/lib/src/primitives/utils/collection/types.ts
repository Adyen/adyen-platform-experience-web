export type List<T = any> = (List<T> | T)[];
export type MapType<K, V> = K extends object ? Map<K, V> | WeakMap<K, V> : Map<K, V>;
export type MapGetter = <K, V>(key: K, map: MapType<K, V>, factory?: (key: K, map: MapType<K, V>) => V | undefined) => V | undefined;
