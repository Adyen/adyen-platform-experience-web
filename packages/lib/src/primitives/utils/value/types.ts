export type Nullable<T = any> = T | null | undefined;
export type Defined<T = any> = Exclude<T, undefined>;
export type DefinedNullable<T = any> = Defined<Nullable<T>>;
