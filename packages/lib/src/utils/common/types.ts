export type GetterPropertyDescriptor<T> = Pick<
    {
        [K in keyof TypedPropertyDescriptor<T>]: K extends 'get' | 'enumerable' ? TypedPropertyDescriptor<T>[K] & {} : never;
    },
    'get' | 'enumerable'
>;
