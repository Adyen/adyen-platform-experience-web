import type { API_ENDPOINTS } from '../../../core/Services/requests/endpoints';

type AvailableHttpMethods = 'get' | 'post';

type IsStringOrFunction<T> = T extends (...args: any) => any ? ReturnType<T> : T;

type NestedUnion<T> = T extends object
    ? {
          [K in keyof T]: NestedUnion<IsStringOrFunction<T[K]>>;
      }[keyof T]
    : T;

type AvailablePaths = NestedUnion<typeof API_ENDPOINTS>;

type HasMethodAvailable<T, M extends keyof any> = M extends keyof T ? true : false;

type NarrowByMethod<M extends AvailableHttpMethods, Paths extends Record<any, any>, URL extends AvailablePaths = AvailablePaths> = {
    [k in URL]: HasMethodAvailable<Paths[k], M> extends true ? k : never;
}[URL] & {};

export type SuccessGETResponse<
    Paths extends Record<any, any>,
    T extends NarrowByMethod<'get', Paths>
> = Paths[T]['get']['responses'][200]['content']['application/json'];

export type Schema<T extends Record<any, any>, Name extends keyof T['schemas']> = T['schemas'][Name];
