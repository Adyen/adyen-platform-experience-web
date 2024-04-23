export type GetterPropertyDescriptor<T> = Pick<
    {
        [K in keyof TypedPropertyDescriptor<T>]: K extends 'get' | 'enumerable' ? TypedPropertyDescriptor<T>[K] & {} : never;
    },
    'get' | 'enumerable'
>;

export type MapType<K, V> = K extends object ? Map<K, V> | WeakMap<K, V> : Map<K, V>;

export type MapGetter = <K, V>(key: K, map: MapType<K, V>, factory?: (key: K, map: MapType<K, V>) => V | undefined) => V | undefined;

// [TODO]: Make available when TS version has been updated
// export type WithGetSetProperty<GetValue = any, SetValue = GetValue> = {
//     get _(): GetValue;
//     set _(value: SetValue);
// };
