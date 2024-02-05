import type { paths } from '../openapi/schema';
import type { API_ENDPOINTS } from '../../../core/Services/requests/endpoints';
import { components } from '../openapi/schema';

type AvailableHttpMethods = 'get' | 'post';

type IsStringOrFunction<T> = T extends (...args: any) => any ? ReturnType<T> : T;

type NestedUnion<T> = T extends object
    ? {
          [K in keyof T]: NestedUnion<IsStringOrFunction<T[K]>>;
      }[keyof T]
    : T;

type AvailablePaths = NestedUnion<typeof API_ENDPOINTS>;

type HasMethodAvailable<T, M extends keyof any> = M extends keyof T ? true : false;

type NarrowByMethod<M extends AvailableHttpMethods, URL extends AvailablePaths = AvailablePaths> = {
    [k in URL]: HasMethodAvailable<paths[k], M> extends true ? k : never;
}[URL] & {};

export type SuccessGETResponse<T extends NarrowByMethod<'get'>> = paths[T]['get']['responses'][200]['content']['application/json'];

export type Schema<T extends Record<any, any>, Name extends keyof T['schemas']> = T['schemas'][Name];
