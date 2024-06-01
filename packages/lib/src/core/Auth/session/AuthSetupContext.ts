import Core from '../../core';
import { parseSearchParams } from '../../Http/utils';
import { createAbortable } from '../../../primitives/async/abortable';
import { createPromisor } from '../../../primitives/async/promisor';
import { createErrorContainer } from '../../../primitives/common/errorContainer';
import { createEventEmitter } from '../../../primitives/reactive/eventEmitter';
import { EVT_SESSION_INIT, SessionContext } from '../../../primitives/context/session';
import { asPlainObject, EMPTY_OBJECT, isPlainObject, isUndefined, noop, struct, withFreezeProxyHandlers } from '../../../utils';
import { ERR_SETUP_ABORTED, ERR_SETUP_FAILED, EVT_SETUP_INIT, SETUP_ENDPOINT_PATH } from './constants';
import type { HttpMethod } from '../../Http/types';
import type { EndpointName, SetupEndpoint } from '../../../types/api/endpoints';
import type { EndpointHttpCallables, EndpointSuccessResponse, SessionObject, SetupContext, SetupResponse } from '../types';

export class AuthSetupContext {
    private _endpoints: SetupContext['endpoints'] = EMPTY_OBJECT;
    private _lastSessionTimestamp: number | undefined;
    private _refreshInProgress = false;
    private _refreshResuming = false;
    private _revokeEndpointsProxy = noop;

    private readonly _errorContainer = createErrorContainer();
    private readonly _eventEmitter = createEventEmitter<typeof EVT_SETUP_INIT>();
    private readonly _refreshAbortable = createAbortable(ERR_SETUP_ABORTED);
    private readonly _sessionInitPromisor = createPromisor<void>();

    declare loadingContext?: Core<any>['loadingContext'];
    declare on: (typeof this._eventEmitter)['on'];
    declare refresh: () => void;

    constructor(private readonly _session: SessionContext<SessionObject, any[]>) {
        this.on = this._eventEmitter.on;
        this.refresh = this._refresh.bind(this);

        this._session.on(EVT_SESSION_INIT, () => {
            this._session.refreshing ? this._waitForSessionRefresh() : this._onSessionRefresh();
        });
    }

    get endpoints() {
        return this._endpoints;
    }

    get hasError() {
        return this._errorContainer.hasError;
    }

    get refreshing() {
        return this._refreshInProgress;
    }

    private async _doRefresh() {
        if (this._refreshResuming) {
            this._refreshResuming = false;
        } else {
            this._errorContainer.reset();
            this._resetEndpoints();
            this._eventEmitter.emit(EVT_SETUP_INIT);
        }

        await this._sessionInitPromisor.promise;

        // Capture the current abort signal for this refresh
        const signal = this._refreshAbortable.signal;

        const setupEndpointCall = this._session.http({
            method: 'POST',
            path: SETUP_ENDPOINT_PATH,
            errorLevel: 'fatal',
            loadingContext: this.loadingContext,
            signal,
        }) as Promise<SetupResponse>;

        this._refreshInProgress = true;

        try {
            const { endpoints } = await Promise.race([setupEndpointCall, this._refreshAbortable.promise]);
            if (signal.aborted) throw void 0;
            ({ proxy: this._endpoints, revoke: this._revokeEndpointsProxy } = this._getEndpointsProxy(endpoints));
        } catch (ex) {
            if (signal.aborted) throw ERR_SETUP_ABORTED;
            this._errorContainer.set(ex);
            throw ERR_SETUP_FAILED;
        } finally {
            this._refreshInProgress = false;
            this._eventEmitter.emit(EVT_SETUP_INIT);
        }
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

    private _onSessionRefresh() {
        if (this._lastSessionTimestamp === this._session.timestamp) return;

        this._sessionInitPromisor.resolve();

        if (this._refreshInProgress) {
            this._refreshInProgress = false;
            this._refreshResuming = true;
            this._refresh();
        }
    }

    private _refresh() {
        if (this._refreshInProgress) return;
        this._doRefresh().catch(noop);
    }

    private _resetEndpoints() {
        this._revokeEndpointsProxy();
        this._revokeEndpointsProxy = noop;
        this._endpoints = EMPTY_OBJECT;
    }

    private _waitForSessionRefresh() {
        this._sessionInitPromisor.refresh();
        this._lastSessionTimestamp = this._session.timestamp;

        if (this._refreshInProgress) {
            this._refreshAbortable.abort();
            this._refreshAbortable.refresh();
        }
    }
}

export default AuthSetupContext;
