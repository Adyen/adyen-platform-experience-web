export type Nullable<T = any> = T | null | undefined;
export type Defined<T = any> = Exclude<T, undefined>;
export type DefinedNullable<T = any> = Defined<Nullable<T>>;

type _ExtractWithFallback<T, U> = T extends T ? Extract<T, U> : never;
export type ExtractWithFallback<T, U> = _ExtractWithFallback<T, U> extends never ? U : _ExtractWithFallback<T, U>;
export type GetPredicateType<Predicate, Type = unknown> = Extract<Type, ExtractWithFallback<Type, Predicate>>;

export type List<T = any> = (List<T> | T)[];
export type ListWithoutFirst<T> = T extends [any, ...infer Rest] ? Rest : [];

export type PredicateType<T> = T extends (value: any) => value is infer P ? P : T extends (value: any) => asserts value is infer P ? P : never;

export type Promised<T> = T | PromiseLike<T>;

export const enum PromiseState {
    PENDING = 'pending',
    FULFILLED = 'fulfilled',
    REJECTED = 'rejected',
}

export type KeyOfRecord<T> = T extends T ? keyof T : never;
export type ValueOfRecord<T extends Record<any, any>> = T extends T ? T[keyof T] : never;
export type NullableFields<T> = T extends T ? { [K in keyof Partial<T>]: T[K] | null } : never;

export type Struct<T extends Record<any, any>> = T extends T
    ? T & {
          [key: string | number | symbol]: any;
      }
    : never;

export type WithPartialField<T, Field extends KeyOfRecord<T>> = T extends T
    ? {
          [P in keyof T]: Field extends P ? T[P] | undefined : T[P];
      }
    : never;

export type WithReplacedUnderscoreOrDash<
    S extends string,
    Character extends '-' | '_',
    Replace extends '-' | '_'
> = S extends `${infer T}${Character}${infer U}` ? `${T}${Replace}${U}` : S;

type StrictUnionHelper<T, TAll> = T extends any ? T & Partial<Record<Exclude<KeyOfRecord<TAll>, keyof T>, never>> : never;
export type StrictUnion<T> = StrictUnionHelper<T, T>;

export type StringWithAutocompleteOptions<T> = T | (string & {});

type _NestedObjectProp<T extends object, K extends keyof T> = K extends K ? (T[K] extends object ? K : never) : never;

type NestedObjectProp<T extends object> = Extract<keyof T, _NestedObjectProp<T, keyof T>>;

export type DeepReadonly<T> = T extends object
    ? Omit<Readonly<T>, NestedObjectProp<T>> & Readonly<{ [K in NestedObjectProp<T>]: DeepReadonly<T[K]> }>
    : T;
