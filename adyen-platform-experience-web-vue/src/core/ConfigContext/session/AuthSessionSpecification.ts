import { ERR_SESSION_EXPIRED } from '../../../primitives/context/session';
import { abortSignalForAny, isAbortSignal, isPlainObject, isString, isUndefined } from '../../../utils';
import { http as _http } from '../../Http/http';
import { ErrorTypes } from '../../Http/utils';
import { AUTO_REFRESH, MAX_AGE_MS } from './constants';
import { enumerable } from '../../../utils/struct/property';
import type { SessionSpecification } from '../../../primitives/context/session';
import type { HttpOptions } from '../../Http/types';
import type { SessionObject, SessionRequest, onErrorHandler } from '../../types';

type _AuthSessionSpecification = SessionSpecification<SessionObject, Parameters<typeof _http>>;

export class AuthSessionSpecification implements _AuthSessionSpecification {
    declare public errorHandler: onErrorHandler | null;

    declare public readonly autoRefresh: _AuthSessionSpecification['autoRefresh'];
    declare public readonly onRefresh: _AuthSessionSpecification['onRefresh'];

    constructor(public onSessionCreate?: SessionRequest) {
        this._errorHandler = this._errorHandler.bind(this);

        Object.defineProperties(this, {
            autoRefresh: enumerable(AUTO_REFRESH),
            onRefresh: enumerable((_: SessionObject | undefined, signal: AbortSignal) => this.onSessionCreate!(signal)),
        });
    }

    public readonly assert: _AuthSessionSpecification['assert'] = maybeSession => {
        if (isPlainObject(maybeSession)) {
            const sessionObject = maybeSession as Partial<SessionObject>;
            const id = isString(sessionObject.id) ? sessionObject.id.trim() : undefined;
            const token = isString(sessionObject.token) ? sessionObject.token.trim() : undefined;
            if (id && token) return;
        }
        throw undefined;
    };

    public readonly deadline: _AuthSessionSpecification['deadline'] = session => {
        const deadlines = [];
        let issuedAt: number;
        let expiresAt: number;

        try {
            ({ iat: issuedAt, exp: expiresAt } = JSON.parse(atob(session?.token.split('.')[1]!)));
            deadlines.push(expiresAt * 1000);
        } catch {
            /* ignore malformed token errors */
            issuedAt = Date.now() / 1000;
        }

        if (!isUndefined(MAX_AGE_MS)) {
            const issuedAtDate = new Date(issuedAt * 1000);
            deadlines.push(issuedAtDate.setMilliseconds(issuedAtDate.getMilliseconds() + MAX_AGE_MS));
        }

        return deadlines;
    };

    public http: _AuthSessionSpecification['http'] = async (session, sessionSignal, httpOptions: HttpOptions) => {
        const { headers, signal, ...restOptions } = httpOptions;
        try {
            const sessionHttpOptions = {
                ...restOptions,
                headers: {
                    ...headers,
                    ...(session && { Authorization: `Bearer ${session.token}` }),
                },
                errorHandler: this._errorHandler,
                signal: isAbortSignal(signal) ? abortSignalForAny([sessionSignal, signal]) : sessionSignal,
            };
            return await _http(sessionHttpOptions);
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
