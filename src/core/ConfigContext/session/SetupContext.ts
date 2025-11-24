import Core from '../../core';
import { SETUP_ENDPOINT_PATH, SETUP_ENDPOINTS_API_VERSIONS } from './constants';
import { parseSearchParams } from '../../Http/utils';
import { SessionContext } from '../../../primitives/context/session';
import { createPromisor } from '../../../primitives/async/promisor';
import {
    abortSignalForAny,
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
import type { EndpointHttpCallables, EndpointSuccessResponse, SessionObject, SetupContextObject, SetupResponse } from '../types';
import type { EndpointName, SetupEndpoint } from '../../../types/api/endpoints';
import type { HttpMethod, HttpOptions } from '../../Http/types';
import { encodeAnalyticsEvent } from '../../Analytics/analytics/utils';

export class SetupContext {
    private _endpoints: SetupContextObject['endpoints'] = EMPTY_OBJECT;
    private _extraConfig: SetupContextObject['extraConfig'] = EMPTY_OBJECT;
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

    declare public loadingContext?: Core<any>['loadingContext'];
    declare public analyticsPayload?: Array<URLSearchParams> | undefined;
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
                    this._extraConfig = deepFreeze(rest);
                    if (this.analyticsEnabled) {
                        this._setAnalyticsUserProfile()?.then(() => {
                            this.setCustomTranslationsAnalytics();
                        });
                    }
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

    private async _setAnalyticsUserProfile() {
        const data = encodeAnalyticsEvent([{}]);
        if (this._endpoints.sendEngageEvent && data) {
            return this._endpoints.sendEngageEvent(
                {
                    body: data,
                    contentType: 'application/x-www-form-urlencoded',
                },
                EMPTY_OBJECT
            );
        }
        return;
    }

    private async setCustomTranslationsAnalytics() {
        if (this.analyticsPayload && this.analyticsPayload?.length > 0 && this._endpoints && this._endpoints.sendTrackEvent) {
            const retryPayload: URLSearchParams[] = [];
            Promise.all(
                this.analyticsPayload.map((payload: URLSearchParams) => {
                    return this._endpoints.sendTrackEvent!(
                        {
                            body: payload,
                            contentType: 'application/x-www-form-urlencoded',
                        },
                        EMPTY_OBJECT
                    ).catch(() => {
                        retryPayload.push(payload);
                    });
                })
            ).finally(() => {
                this.analyticsPayload = retryPayload.length > 0 ? retryPayload : undefined;
            });
        }
        return;
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

                    const apiVersion = SETUP_ENDPOINTS_API_VERSIONS[endpoint];
                    const overrideHttpOptions: Partial<HttpOptions> = apiVersion ? { apiVersion } : EMPTY_OBJECT;

                    sessionAwareEndpoints[endpoint] ??= (() => {
                        const { method = 'GET', url } = endpoints[endpoint];
                        if (isUndefined(url || undefined)) return;

                        return ((...args: Parameters<EndpointHttpCallables>) => {
                            const httpOptions = {
                                ...this._getHttpOptions(method as HttpMethod, url!, ...args),
                                ...overrideHttpOptions,
                            };
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
