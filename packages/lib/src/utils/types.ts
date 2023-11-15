export type ValueOf<T> = T[keyof T];
export type Nullable<T> = { [K in keyof Partial<T>]: T[K] | null };
export type ReplaceDashWithUnderscore<S extends string> = S extends `${infer T}-${infer U}` ? `${T}_${U}` : S;
