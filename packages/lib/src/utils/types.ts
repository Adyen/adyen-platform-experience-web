export type Nullable<T = any> = T | null | undefined;
export type Defined<T = any> = Exclude<T, undefined>;
export type DefinedNullable<T = any> = Defined<Nullable<T>>;

export type List<T = any> = (List<T> | T)[];
export type ListWithoutFirst<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never;

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
