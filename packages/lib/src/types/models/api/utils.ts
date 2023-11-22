import { paths } from '../openapi/schema';
import type { API_ENDPOINTS } from '@src/core/Services/requests/endpoints';
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

//////////////////////////////////////////////////////////////////////////

/* const _USED_URLS = {
    transactions: { get: ['/transactions', '/transactions/{id}'] },
} as const satisfies Readonly<Record<string, Partial<Record<AvailableHttpMethods, Readonly<string[]>>>>>;

type HasMethod<T, Method extends AvailableHttpMethods> = T extends { [k in Method]: Readonly<string[]> } ? T : never;


export type AvailableUrls<Method extends AvailableHttpMethods, T extends typeof _USED_URLS = typeof _USED_URLS> = {
    [K in keyof T]: T[K] extends HasMethod<T[K], Method> ? T[K][Method] : never;
}[keyof T][number];

export type SuccessGETResponse2<T extends AvailableUrls<'post'>> = paths[T]['get']['responses'][200]['content']['application/json']; */

//////////////////////////////////////////////////////////////////////////
