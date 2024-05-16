import { parseSearchParams } from '../../Services/requests/utils';
import { createErrorContainer } from '../../../primitives/common/errorContainer';
import { createEventEmitter, Emitter } from '../../../primitives/reactive/eventEmitter';
import { asPlainObject, isPlainObject, noop, struct, truthify } from '../../../primitives/utils';
import { EVT_SESSION_INIT_STATE_CHANGE } from '../../../primitives/session';
import type { HttpMethod } from '../../Services/requests/types';
import type { EndpointName, EndpointsOperations, SetupEndpoint } from '../../../types/api/endpoints';
import type { EndpointHttpCallable, EndpointHttpParameters, EndpointSuccessResponse, SetupContext, SetupResponse } from './types';
import AuthSession from './AuthSession';

const _SECRET_EMPTY_OBJECT: Record<string, any> = Object.freeze(struct());
const _SETUP_ENDPOINT_PATH = '/setup';

export const ERR_SESSION_SETUP_FAILED: unique symbol = Symbol('Error<SESSION_SETUP_FAILED>');
export const EVT_SETUP_INIT_STATE_CHANGE = 'session:setupInitStateChange';

export class AuthSessionSetupContext {
    readonly #session: AuthSession;
    readonly #setupErrorContainer = createErrorContainer();
    readonly #setupEventEmitter = createEventEmitter<typeof EVT_SETUP_INIT_STATE_CHANGE>();

    readonly on: Emitter<typeof EVT_SETUP_INIT_STATE_CHANGE>['on'];

    #setupEndpoints: SetupContext['endpoints'] = _SECRET_EMPTY_OBJECT;
    #setupEndpointsRevokeProxy = noop;
    #setupPromise: Promise<void> | undefined;

    loadingContext?: string;

    constructor(session: AuthSession) {
        this.#session = session;

        this.#session.on(EVT_SESSION_INIT_STATE_CHANGE, () => {
            if (this.#session.initializing) {
                this.#setupSession().catch(noop);
            }
        });

        this.on = this.#setupEventEmitter.on;
    }

    get endpoints() {
        return this.#setupEndpoints;
    }

    get hasError() {
        return this.#setupErrorContainer.hasError;
    }

    set onSessionCreate(value: AuthSession['onSessionCreate']) {
        this.#session.onSessionCreate = value;
    }

    #getSetupEndpointsProxyObject(endpoints: SetupEndpoint) {
        const availableEndpoints = new Set<EndpointName>(Object.keys(endpoints) as (keyof typeof endpoints)[]);
        const wrappedEndpoints = new Map<EndpointName, EndpointHttpCallable>();

        return Proxy.revocable(_SECRET_EMPTY_OBJECT as SetupContext['endpoints'], {
            defineProperty: truthify,
            get: (target: SetupContext['endpoints'], endpoint: EndpointName, receiver: any) => {
                if (availableEndpoints.has(endpoint)) {
                    let value = wrappedEndpoints.get(endpoint);

                    while (value === undefined) {
                        const operation = endpoints[endpoint];
                        const { method = 'GET', url } = asPlainObject<typeof operation>(operation);
                        if (!url) break;

                        value = <Endpoint extends EndpointName, Operation extends EndpointsOperations[Endpoint]>(
                            ...args: EndpointHttpParameters<Endpoint, Operation>
                        ): Promise<EndpointSuccessResponse<Operation>> => {
                            const [request, params] = args;
                            const { path: pathParams, query: queryParams } = asPlainObject(params);
                            let path = url;

                            if (isPlainObject(pathParams)) {
                                for (const pathParamKey of Object.keys(pathParams)) {
                                    path = path.replace(`{${pathParamKey}}`, pathParams[pathParamKey]);
                                }
                            }

                            return this.#session.http({
                                loadingContext: this.loadingContext,
                                ...(request as object),
                                method: method as HttpMethod,
                                params: queryParams && parseSearchParams(queryParams),
                                path,
                            }) as Promise<EndpointSuccessResponse<Operation>>;
                        };

                        wrappedEndpoints.set(endpoint, value);
                    }

                    return value;
                }
                return Reflect.get(target, endpoint, receiver);
            },
            set: truthify,
        });
    }

    #resetSetupEndpoints() {
        this.#setupEndpointsRevokeProxy();
        this.#setupEndpointsRevokeProxy = noop;
        this.#setupEndpoints = _SECRET_EMPTY_OBJECT;
    }

    #setupSession() {
        this.#setupPromise ??= (async () => {
            try {
                this.#setupErrorContainer.reset();
                this.#resetSetupEndpoints();
                this.#setupEventEmitter.emit(EVT_SETUP_INIT_STATE_CHANGE);

                const { endpoints } = await (this.#session.http({
                    method: 'POST',
                    path: _SETUP_ENDPOINT_PATH,
                    errorLevel: 'fatal',
                    loadingContext: this.loadingContext,
                }) as Promise<SetupResponse>);

                ({ proxy: this.#setupEndpoints, revoke: this.#setupEndpointsRevokeProxy } = this.#getSetupEndpointsProxyObject(endpoints));
            } catch (ex) {
                this.#setupErrorContainer.set(ex);
                throw ERR_SESSION_SETUP_FAILED;
            } finally {
                this.#setupPromise = undefined;
                this.#setupEventEmitter.emit(EVT_SETUP_INIT_STATE_CHANGE);
            }
        })();

        return this.#setupPromise;
    }
}

export default AuthSessionSetupContext;
