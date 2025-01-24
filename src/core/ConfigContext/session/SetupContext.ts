import Core from '../../core';
import { SETUP_ENDPOINT_PATH } from './constants';
import { parseSearchParams } from '../../Http/utils';
import { SessionContext } from '../../../primitives/context/session';
import { createPromisor } from '../../../primitives/async/promisor';
import {
    abortSignalForAny,
    asPlainObject,
    deepFreeze,
    DeepReadonly,
    EMPTY_OBJECT,
    isAbortSignal,
    isPlainObject,
    isUndefined,
    noop,
    struct,
    withFreezeProxyHandlers,
} from '../../../utils';
import type { EndpointHttpCallables, EndpointSuccessResponse, SessionObject, SetupContextObject, SetupResponse } from '../types';
import type { EndpointName, SetupEndpoint } from '../../../types/api/endpoints';
import type { HttpMethod } from '../../Http/types';

export class SetupContext {
    private _endpoints: SetupContextObject['endpoints'] = EMPTY_OBJECT;
    private _configuration: Omit<SetupResponse, 'endpoints'> = EMPTY_OBJECT;
    private _revokeEndpointsProxy = noop;

    private readonly _beforeHttp = async () => {
        // a no-op catch callback is used here (`noop`),
        // to silence unnecessary unhandled promise rejection warnings
        await this._refreshPromisor.promise.catch(noop);
    };

    private readonly _refreshPromisor = createPromisor((promisorSignal, signal?: AbortSignal | null | undefined) => {
        const abortSignal = isAbortSignal(signal) ? abortSignalForAny([signal, promisorSignal]) : promisorSignal;
        return this._fetchSetupEndpoint(abortSignal);
    });

    public declare loadingContext?: Core<any>['loadingContext'];
    public declare readonly refresh: (signal: AbortSignal) => Promise<void>;

    constructor(private readonly _session: SessionContext<SessionObject, any[]>) {
        let _refreshPromise: Promise<void> | undefined;

        this.refresh = signal => {
            this._refreshPromisor(signal).catch(noop);

            return (_refreshPromise ??= this._refreshPromisor.promise
                .finally(() => (_refreshPromise = undefined))
                .then(({ endpoints, ...rest }) => {
                    this._resetEndpoints();
                    ({ proxy: this._endpoints, revoke: this._revokeEndpointsProxy } = this._getEndpointsProxy(endpoints));
                    this._configuration = deepFreeze(rest);
                }));
        };
    }

    get endpoints() {
        return this._endpoints;
    }

    get configuration() {
        return this._configuration;
    }

    private _fetchSetupEndpoint(signal: AbortSignal) {
        return this._session.http(null, {
            method: 'POST',
            path: SETUP_ENDPOINT_PATH,
            errorLevel: 'fatal',
            loadingContext: this.loadingContext,
            signal,
        }) as Promise<SetupResponse>;
    }

    private _getEndpointsProxy(endpoints: SetupEndpoint) {
        const availableEndpoints: Set<EndpointName> = new Set(Object.keys(endpoints) as (keyof typeof endpoints)[]);
        const sessionAwareEndpoints: SetupContextObject['endpoints'] = struct();

        return Proxy.revocable(
            EMPTY_OBJECT as typeof sessionAwareEndpoints,
            withFreezeProxyHandlers({
                get: <Endpoint extends EndpointName>(target: typeof sessionAwareEndpoints, endpoint: Endpoint, receiver: any) => {
                    if (!availableEndpoints.has(endpoint)) {
                        return Reflect.get(target, endpoint, receiver);
                    }

                    sessionAwareEndpoints[endpoint] ??= (() => {
                        const { method = 'GET', url } = endpoints[endpoint];
                        if (isUndefined(url || undefined)) return;

                        return ((...args: Parameters<EndpointHttpCallables>) => {
                            const httpOptions = this._getHttpOptions(method as HttpMethod, url!, ...args);
                            return this._session.http(this._beforeHttp, httpOptions) as Promise<EndpointSuccessResponse<Endpoint>>;
                        }) as EndpointHttpCallables<Endpoint>;
                    })()!;

                    return sessionAwareEndpoints[endpoint];
                },
            })
        );
    }

    private _getHttpOptions(method: HttpMethod, path: string, ...args: Parameters<EndpointHttpCallables>) {
        const { loadingContext } = this;
        const [request, requestParams] = args;
        const { path: pathParams, query: searchParams } = asPlainObject(requestParams as any);
        const params = searchParams && parseSearchParams(searchParams);

        if (isPlainObject(pathParams)) {
            for (const pathParamKey of Object.keys(pathParams)) {
                path = path.replace(`{${pathParamKey}}`, pathParams[pathParamKey]);
            }
        }

        return { loadingContext, ...request, method, params, path } as const;
    }

    private _resetEndpoints() {
        this._revokeEndpointsProxy();
        this._revokeEndpointsProxy = noop;
        this._endpoints = EMPTY_OBJECT;
    }
}

export default SetupContext;
