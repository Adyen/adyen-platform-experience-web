import { createErrorContainer } from '../../../primitives/common/errorContainer';
import { createSessionHandle, ERR_SESSION_EXPIRED, Session, SessionProvisioningParams } from '../../../primitives/session';
import { isPlainObject, isString } from '../../../primitives/utils';
import { http as _http } from '../../Services/requests/http';
import { ErrorTypes } from '../../Services/requests/utils';
import type { HttpOptions } from '../../Services/requests/types';
import type { SessionObject } from './types';

type _HttpParams = Parameters<typeof _http>;

export class AuthSession {
    // Value should be provisioned in the `SESSION_MAX_AGE_MS` environment variable
    static readonly #MAX_AGE_MS = ~~process.env.SESSION_MAX_AGE_MS! || Infinity;

    readonly #maxAgeMs = Number.isFinite(AuthSession.#MAX_AGE_MS) ? Math.max(0, ~~AuthSession.#MAX_AGE_MS) || Infinity : undefined;
    readonly #session: ReturnType<typeof createSessionHandle<SessionObject, _HttpParams>>;
    readonly #sessionErrorContainer = createErrorContainer();
    readonly #sessionProvisioningParams: SessionProvisioningParams<SessionObject, _HttpParams>;

    readonly http: Session<SessionObject, _HttpParams>['http'];
    readonly on: Session<SessionObject, _HttpParams>['on'];

    onSessionCreate?: (...args: any[]) => Promise<SessionObject>;

    constructor() {
        const _this = this;

        this.#sessionProvisioningParams = {
            assert: maybeSession => {
                if (isPlainObject<SessionObject>(maybeSession)) {
                    const id = isString(maybeSession.id) ? maybeSession.id.trim() : undefined;
                    const token = isString(maybeSession.token) ? maybeSession.token.trim() : undefined;
                    if (id && token) return;
                }
                throw undefined;
            },

            get createNext() {
                return _this.onSessionCreate;
            },

            getDeadline: session => {
                const { iat: issuedAt, exp: expiresAt } = JSON.parse(atob(session.token.split('.')[1]!));

                if (Number.isFinite(this.#maxAgeMs)) {
                    const issuedAtDate = new Date(issuedAt);
                    return issuedAtDate.setMilliseconds(issuedAtDate.getMilliseconds() + this.#maxAgeMs!);
                }

                return expiresAt;
            },

            http: async (session, options: HttpOptions, data?: any) => {
                try {
                    return await _http(
                        {
                            ...options,
                            headers: {
                                ...options.headers,
                                ...(session && { Authorization: `Bearer ${session.token}` }),
                            },
                        },
                        data
                    );
                } catch (ex: any) {
                    if (ex?.type === ErrorTypes.EXPIRED_TOKEN) throw ERR_SESSION_EXPIRED;
                    throw ex;
                }
            },
        };

        this.#session = createSessionHandle(this.#sessionProvisioningParams);

        this.http = this.#session.http;
        this.on = this.#session.on;
        this.refresh = this.refresh.bind(this);
    }

    get hasError() {
        return this.#sessionErrorContainer.hasError;
    }

    get initializing() {
        return this.#session.initializing;
    }

    get isExpired() {
        return this.#session.isExpired;
    }

    get timestamp() {
        return this.#session.timestamp;
    }

    async refresh(): Promise<void> {
        try {
            this.#sessionErrorContainer.reset();
            return await this.#session(this.#sessionProvisioningParams);
        } catch (ex) {
            this.#sessionErrorContainer.set(ex);
            throw ex;
        }
    }
}

export default AuthSession;
