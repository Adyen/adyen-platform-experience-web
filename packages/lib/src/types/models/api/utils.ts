export type Schema<T extends Record<any, any>, Name extends keyof T['schemas']> = T['schemas'][Name];
