export type ValueOf<T extends Record<any, any>> = T[keyof T];
export type Nullable<T> = { [K in keyof Partial<T>]: T[K] | null };
export type ReplaceUnderscoreOrDash<
    S extends string,
    Character extends '-' | '_',
    Replace extends '-' | '_'
> = S extends `${infer T}${Character}${infer U}` ? `${T}${Replace}${U}` : S;
export type MakeFieldValueUndefined<T, Field extends keyof T> = {
    [P in keyof T]: Field extends P ? T[P] | undefined : T[P];
};
