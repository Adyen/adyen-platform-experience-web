import { DelayMode, http, HttpHandler, HttpResponse, JsonBodyType } from 'msw';
import { delay } from './utils';
import { paths as CapitalPaths } from '../../../src/types/api/resources/CapitalResource';
import { paths as TransactionPaths } from '../../../src/types/api/resources/TransactionsResource';

type RemoveVersionFromUrl<T extends string> = T extends `${infer Prefix}/v${string}/${infer Rest}` ? `${Prefix}/${Rest}` : T;
type PathWithBaseUrl<T extends string> = `${string}${RemoveVersionFromUrl<T>}`;

export const getHandlerCallback = <T extends JsonBodyType>({
    response,
    networkError,
    delayTime,
}: {
    response: T;
    networkError?: boolean;
    delayTime?: DelayMode;
}) => {
    return async () => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(delayTime || 200);
        return HttpResponse.json(response);
    };
};

type Handlers<Resource extends Record<string, any>, T extends Record<string, any>> = {
    [k in keyof T]: {
        method?: 'get' | 'post';
        endpoint: PathWithBaseUrl<Extract<keyof Resource, string>>;
        handler?: ReturnType<typeof getHandlerCallback>;
        response?: JsonBodyType;
    }[];
};

export const mocksFactory = <Endpoints extends Record<string, any>>() => {
    return new MocksHandlerFactory<Endpoints>()['generate'];
};

class MocksHandlerFactory<Endpoints extends Record<string, any>> {
    public generate<T extends Record<string, any>>(handlers: Handlers<Endpoints, T>): { [K in keyof T]: HttpHandler[] } {
        const result = {} as { [K in keyof T]: HttpHandler[] };
        for (const handlerKey in handlers) {
            result[handlerKey] = handlers[handlerKey]!.map(({ method, endpoint, handler, response }) =>
                http[method || 'get'](endpoint, handler || getHandlerCallback({ response }))
            );
        }
        return result;
    }
}
