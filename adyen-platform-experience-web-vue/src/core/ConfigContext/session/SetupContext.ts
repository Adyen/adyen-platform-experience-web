import { SETUP_ENDPOINT_PATH, SETUP_ENDPOINTS_API_VERSIONS } from './constants';
import { parseSearchParams } from '../../Http/utils';
import { SessionContext } from '../../../primitives/context/session';
import { createPromisor } from '../../../primitives/async/promisor';
import {
    asPlainObject,
    deepFreeze,
    EMPTY_OBJECT,
    isAbortSignal,
    isPlainObject,
    isUndefined,
    noop,
    struct,
    withFreezeProxyHandlers,
} from '../../../utils';
import type { SessionObject } from '../../types';
import type { HttpMethod, HttpOptions } from '../../Http/types';
import type { EndpointCallable, EndpointParams, EndpointRequestOptions, SetupEndpoint, SetupResponse } from '../types';
import { abortSignalForAny } from '../../../utils';

interface SetupContextObject {
    // TODO: Replace with proper type when available (OPENAPI-generated types)
    readonly endpoints: Record<string, EndpointCallable | undefined>;
    readonly extraConfig: Readonly<Record<string, unknown>>;
}

export class SetupContext {
    private _endpoints: SetupContextObject['endpoints'] = EMPTY_OBJECT as SetupContextObject['endpoints'];
    private _extraConfig: SetupContextObject['extraConfig'] = EMPTY_OBJECT as SetupContextObject['extraConfig'];
    private _revokeEndpointsProxy = noop;

    private readonly _beforeHttp = async () => {
        // a no-op catch callback is used here (`noop`),
        // to silence unnecessary unhandled promise rejection warnings
        await this._refreshPromisor.promise.catch(noop);
    };

    private readonly _refreshPromisor = createPromisor((promisorSignal: AbortSignal, signal?: AbortSignal | null | undefined) => {
        const abortSignal = isAbortSignal(signal) ? abortSignalForAny([signal, promisorSignal]) : promisorSignal;
        return this._fetchSetupEndpoint(abortSignal);
    });

    declare public loadingContext?: string;
    declare public analyticsEnabled?: boolean;
    declare public readonly refresh: (signal: AbortSignal) => Promise<void>;

    constructor(private readonly _session: SessionContext<SessionObject, any[]>) {
        let _refreshPromise: Promise<void> | undefined;

        this.refresh = signal => {
            this._refreshPromisor(signal).catch(noop);

            return (_refreshPromise ??= this._refreshPromisor.promise
                .finally(() => (_refreshPromise = undefined))
                .then(({ endpoints, ...rest }) => {
                    this._resetEndpoints();
                    ({ proxy: this._endpoints, revoke: this._revokeEndpointsProxy } = this._getEndpointsProxy(endpoints));
                    this._extraConfig = deepFreeze(rest) as SetupContextObject['extraConfig'];
                }));
        };
    }

    get endpoints() {
        return this._endpoints;
    }

    get extraConfig() {
        return this._extraConfig;
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
        const availableEndpoints: Set<string> = new Set(Object.keys(endpoints));
        const sessionAwareEndpoints: Record<string, EndpointCallable | undefined> = struct();
        let isActive = true;

        const revoke = () => {
            isActive = false;
            availableEndpoints.clear();
        };

        const proxy = new Proxy(
            EMPTY_OBJECT as typeof sessionAwareEndpoints,
            withFreezeProxyHandlers({
                get: (target: typeof sessionAwareEndpoints, endpoint: string, receiver: any) => {
                    if (!isActive || !availableEndpoints.has(endpoint)) {
                        return Reflect.get(target, endpoint, receiver);
                    }

                    const apiVersionOverride = SETUP_ENDPOINTS_API_VERSIONS[endpoint];
                    const overrideHttpOptions: Partial<HttpOptions> = apiVersionOverride
                        ? { apiVersion: apiVersionOverride }
                        : (EMPTY_OBJECT as Partial<HttpOptions>);

                    sessionAwareEndpoints[endpoint] ??= (() => {
                        const endpointDef = endpoints[endpoint]!;
                        const { method = 'GET', url } = endpointDef;
                        if (isUndefined(url || undefined)) return;

                        return ((request?: EndpointRequestOptions, params?: EndpointParams) => {
                            const httpOptions = {
                                ...this._getHttpOptions(method as HttpMethod, url, request, params),
                                ...overrideHttpOptions,
                            };
                            return this._session.http(this._beforeHttp, httpOptions);
                        }) as EndpointCallable;
                    })()!;

                    return sessionAwareEndpoints[endpoint];
                },
            })
        );

        return { proxy, revoke };
    }

    private _getHttpOptions(method: HttpMethod, path: string, request?: EndpointRequestOptions, params?: EndpointParams) {
        const { loadingContext } = this;
        const { path: pathParams, query: searchParams } = asPlainObject(params as any);
        const parsedParams = searchParams && parseSearchParams(searchParams);

        if (isPlainObject(pathParams)) {
            for (const pathParamKey of Object.keys(pathParams)) {
                path = path.replace(`{${pathParamKey}}`, pathParams[pathParamKey]);
            }
        }

        return {
            loadingContext,
            ...request,
            method,
            params: parsedParams,
            path,
        } as const;
    }

    private _resetEndpoints() {
        this._revokeEndpointsProxy();
        this._revokeEndpointsProxy = noop;
        this._endpoints = EMPTY_OBJECT as SetupContextObject['endpoints'];
    }
}
