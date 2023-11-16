export type ValueOf<T> = T[keyof T];
export type Nullable<T> = { [K in keyof Partial<T>]: T[K] | null };
export type ReplaceUnderscoreOrDash<
    S extends string,
    Character extends '-' | '_',
    Replace extends '-' | '_'
> = S extends `${infer T}${Character}${infer U}` ? `${T}${Replace}${U}` : S;
