import { ERR_SESSION_EXPIRED, SessionSpecification } from '../../../../../src/primitives/context/session';
import { abortSignalForAny, enumerable, isAbortSignal, isPlainObject, isString, isUndefined } from '@integration-components/utils';
import { http as _http } from '../Http/http';
import { ErrorTypes } from '../Http/utils';
import { AUTO_REFRESH, MAX_AGE_MS } from './constants';
import type { SessionObject, SessionRequest } from '../ConfigContext.types';
import type { HttpOptions } from '../Http/types';
import type { onErrorHandler } from '../types';

type _AuthSessionSpecification = SessionSpecification<SessionObject, Parameters<typeof _http>>;

// Declaration merging is used here to type runtime-defined class members
// (`autoRefresh` and `onRefresh` are installed via `Object.defineProperties`
// in the constructor) without emitting class field initializers. This pattern
// is also compatible with Playwright's babel transformer, which cannot parse
// `declare` class fields.
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface AuthSessionSpecification {
    errorHandler: onErrorHandler | null;
    readonly autoRefresh: _AuthSessionSpecification['autoRefresh'];
    readonly onRefresh: _AuthSessionSpecification['onRefresh'];
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class AuthSessionSpecification implements _AuthSessionSpecification {
    constructor(public onSessionCreate?: SessionRequest) {
        this._errorHandler = this._errorHandler.bind(this);

        Object.defineProperties(this, {
            autoRefresh: enumerable<typeof this.autoRefresh>(AUTO_REFRESH),
            onRefresh: enumerable<typeof this.onRefresh>((_, signal) => this.onSessionCreate!(signal)),
        });
    }

    public readonly assert: _AuthSessionSpecification['assert'] = maybeSession => {
        if (isPlainObject(maybeSession)) {
            const id = isString(maybeSession.id) ? maybeSession.id.trim() : undefined;
            const token = isString(maybeSession.token) ? maybeSession.token.trim() : undefined;
            if (id && token) return;
        }
        throw undefined;
    };

    public readonly deadline: _AuthSessionSpecification['deadline'] = session => {
        const deadlines = [];
        let issuedAt: number;
        let expiresAt: number;

        try {
            ({ iat: issuedAt, exp: expiresAt } = JSON.parse(atob(session!.token.split('.')[1]!)));
            deadlines.push(expiresAt);
        } catch {
            /* ignore malformed token errors */
            issuedAt = Date.now();
        }

        if (!isUndefined(MAX_AGE_MS)) {
            const issuedAtDate = new Date(issuedAt);
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
            if (ex?.type === ErrorTypes.EXPIRED_TOKEN) {
                throw ERR_SESSION_EXPIRED;
            }
            throw ex;
        }
    };

    private _errorHandler(error: any) {
        try {
            if (this.errorHandler) {
                this.errorHandler(error);
            }
        } catch {
            /* Not interested in errors resulting from this instance's `errorHandler()` method */
        }
        throw error;
    }
}

export default AuthSessionSpecification;
