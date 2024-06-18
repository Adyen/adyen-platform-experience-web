import { ERR_SESSION_EXPIRED, SessionSpecification } from '../../../primitives/context/session';
import { createAbortSink, isAbortSignal } from '../../../primitives/auxiliary/abortSink';
import { enumerable, getter, isPlainObject, isString, isUndefined, noop } from '../../../utils';
import { http as _http } from '../../Http/http';
import { ErrorTypes } from '../../Http/utils';
import type { HttpOptions } from '../../Http/types';
import type { SessionObject, SessionRequest } from '../types';
import { AUTO_REFRESH, MAX_AGE_MS } from './constants';
import { onErrorHandler } from '../../types';

type _AuthSessionSpecification = SessionSpecification<SessionObject, Parameters<typeof _http>>;

export class AuthSessionSpecification implements _AuthSessionSpecification {
    public declare autoRefresh: _AuthSessionSpecification['autoRefresh'];
    public declare onRefresh: _AuthSessionSpecification['onRefresh'];
    public declare errorHandler: onErrorHandler | null;
    constructor(public onSessionCreate?: SessionRequest) {
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
        const { abort: destroyAbortSink = noop, signal } = isAbortSignal(options.signal)
            ? createAbortSink(sessionSignal, options.signal)
            : { signal: sessionSignal };

        const errorHandler = (error: any) => {
            if (this.errorHandler) this.errorHandler(error);
            throw error;
        };

        try {
            const sessionHttpOptions = {
                ...options,
                signal,
                headers: {
                    ...options.headers,
                    ...(session && { Authorization: `Bearer ${session.token}` }),
                },
                ...(this.errorHandler ? { errorHandler } : {}),
            };
            return await _http(sessionHttpOptions, data);
        } catch (ex: any) {
            if (ex?.type === ErrorTypes.EXPIRED_TOKEN) throw ERR_SESSION_EXPIRED;
            throw ex;
        } finally {
            destroyAbortSink();
        }
    };
}

export default AuthSessionSpecification;
