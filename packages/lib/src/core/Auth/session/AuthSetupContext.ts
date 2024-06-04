import Core from '../../core';
import { SETUP_ENDPOINT_PATH } from './constants';
import { parseSearchParams } from '../../Http/utils';
import { SessionContext } from '../../../primitives/context/session';
import { asPlainObject, EMPTY_OBJECT, isPlainObject, isUndefined, noop, struct, withFreezeProxyHandlers } from '../../../utils';
import type { EndpointHttpCallables, EndpointSuccessResponse, SessionObject, SetupContext, SetupResponse } from '../types';
import type { EndpointName, SetupEndpoint } from '../../../types/api/endpoints';
import type { HttpMethod } from '../../Http/types';
import type { Promised } from '../../../utils/types';

export class AuthSetupContext {
    private _endpoints: SetupContext['endpoints'] = EMPTY_OBJECT;
    private _revokeEndpointsProxy = noop;

    declare loadingContext?: Core<any>['loadingContext'];

    constructor(private readonly _session: SessionContext<SessionObject, any[]>) {
        this._fetchSetupEndpoint = this._fetchSetupEndpoint.bind(this);
        this.refresh = this.refresh.bind(this);
    }

    get endpoints() {
        return this._endpoints;
    }

    async refresh(refreshAbortablePromise: <T>(getPromise: Promised<T> | ((signal: AbortSignal) => Promised<T>)) => Promise<T>) {
        this._resetEndpoints();
        const { endpoints } = await refreshAbortablePromise(this._fetchSetupEndpoint);
        ({ proxy: this._endpoints, revoke: this._revokeEndpointsProxy } = this._getEndpointsProxy(endpoints));
    }

    private _fetchSetupEndpoint(signal: AbortSignal) {
        return this._session.http({
            method: 'POST',
            path: SETUP_ENDPOINT_PATH,
            errorLevel: 'fatal',
            loadingContext: this.loadingContext,
            signal,
        }) as Promise<SetupResponse>;
    }

    private _getEndpointsProxy(endpoints: SetupEndpoint) {
        const availableEndpoints: Set<EndpointName> = new Set(Object.keys(endpoints) as (keyof typeof endpoints)[]);
        const sessionAwareEndpoints: SetupContext['endpoints'] = struct();

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
                            return this._session.http(httpOptions) as Promise<EndpointSuccessResponse<Endpoint>>;
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
        const { path: pathParams, query: searchParams } = asPlainObject<Record<any, any>>(requestParams);
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

export default AuthSetupContext;
