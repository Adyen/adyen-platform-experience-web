import { ERR_SESSION_EXPIRED, SessionSpecification } from '../../../primitives/context/session';
import { isPlainObject, isString, isUndefined } from '../../../utils';
import { http as _http } from '../../Http/http';
import { ErrorTypes } from '../../Http/utils';
import type { HttpOptions } from '../../Http/types';
import type { SessionObject, SessionRequest } from '../types';
import { MAX_AGE_MS } from './constants';

type _AuthSessionSpecification = SessionSpecification<SessionObject, Parameters<typeof _http>>;

export class AuthSessionSpecification implements _AuthSessionSpecification {
    constructor(public onSessionCreate?: SessionRequest) {}

    assert: _AuthSessionSpecification['assert'] = function (maybeSession) {
        if (isPlainObject<SessionObject>(maybeSession)) {
            const id = isString(maybeSession.id) ? maybeSession.id.trim() : undefined;
            const token = isString(maybeSession.token) ? maybeSession.token.trim() : undefined;
            if (id && token) return;
        }
        throw undefined;
    };

    deadline: _AuthSessionSpecification['deadline'] = function (session) {
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
            return issuedAtDate.setMilliseconds(issuedAtDate.getMilliseconds() + MAX_AGE_MS);
        }

        return expiresAt!;
    };

    http: _AuthSessionSpecification['http'] = async function (session, options: HttpOptions, data?: any) {
        try {
            const sessionHttpOptions = {
                ...options,
                headers: {
                    ...options.headers,
                    ...(session && { Authorization: `Bearer ${session.token}` }),
                },
            };
            return await _http(sessionHttpOptions, data);
        } catch (ex: any) {
            if (ex?.type === ErrorTypes.EXPIRED_TOKEN) throw ERR_SESSION_EXPIRED;
            throw ex;
        }
    };

    get next(): _AuthSessionSpecification['next'] {
        return this.onSessionCreate!;
    }
}

export default AuthSessionSpecification;
