export type ValueOf<T> = T[keyof T];
export type Nullable<T> = { [K in keyof Partial<T>]: T[K] | null };
