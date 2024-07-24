import { ERR_SESSION_EXPIRED, SessionSpecification } from '../../../primitives/context/session';
import { abortSignalForAny, enumerable, getter, isAbortSignal, isPlainObject, isString, isUndefined } from '../../../utils';
import { http as _http } from '../../Http/http';
import { ErrorTypes } from '../../Http/utils';
import type { HttpOptions } from '../../Http/types';
import type { onErrorHandler } from '../../types';
import type { SessionObject, SessionRequest } from '../types';
import { AUTO_REFRESH, MAX_AGE_MS } from './constants';

type _AuthSessionSpecification = SessionSpecification<SessionObject, Parameters<typeof _http>>;

export class AuthSessionSpecification implements _AuthSessionSpecification {
    public declare autoRefresh: _AuthSessionSpecification['autoRefresh'];
    public declare onRefresh: _AuthSessionSpecification['onRefresh'];
    public declare errorHandler: onErrorHandler | null;

    constructor(public onSessionCreate?: SessionRequest) {
        this._errorHandler = this._errorHandler.bind(this);

        Object.defineProperties(this, {
            autoRefresh: enumerable(AUTO_REFRESH),
            onRefresh: getter(() => this.onSessionCreate!, true),
        });
    }

    public assert: _AuthSessionSpecification['assert'] = maybeSession => {
        if (isPlainObject(maybeSession)) {
            const id = isString(maybeSession.id) ? maybeSession.id.trim() : undefined;
            const token = isString(maybeSession.token) ? maybeSession.token.trim() : undefined;
            if (id && token) return;
        }
        throw undefined;
    };

    public deadline: _AuthSessionSpecification['deadline'] = session => {
        let issuedAt: number;
        let expiresAt: number;

        try {
            ({ iat: issuedAt, exp: expiresAt } = JSON.parse(atob(session.token.split('.')[1]!)));
        } catch {
            /* ignore malformed token errors */
            issuedAt = Date.now();
        }

        if (!isUndefined(MAX_AGE_MS)) {
            const issuedAtDate = new Date(issuedAt);
            return Math.min(expiresAt! ?? Infinity, issuedAtDate.setMilliseconds(issuedAtDate.getMilliseconds() + MAX_AGE_MS));
        }

        return expiresAt!;
    };

    public http: _AuthSessionSpecification['http'] = async (session, sessionSignal, options: HttpOptions, data?: any) => {
        try {
            const sessionHttpOptions = {
                ...options,
                headers: {
                    ...options.headers,
                    ...(session && { Authorization: `Bearer ${session.token}` }),
                },
                errorHandler: this._errorHandler,
                signal: isAbortSignal(options.signal) ? abortSignalForAny([sessionSignal, options.signal]) : sessionSignal,
            };
            return await _http(sessionHttpOptions, data);
        } catch (ex: any) {
            if (ex?.type === ErrorTypes.EXPIRED_TOKEN) throw ERR_SESSION_EXPIRED;
            throw ex;
        }
    };

    private _errorHandler(error: any) {
        try {
            if (this.errorHandler) this.errorHandler(error);
        } catch {
            /* Not interested in errors resulting from this instance's `errorHandler()` method */
        }
        throw error;
    }
}

export default AuthSessionSpecification;
