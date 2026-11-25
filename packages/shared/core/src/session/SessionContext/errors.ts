import { ERR_SESSION_EXPIRED } from './constants';

const _sessionExpiredErrors = new WeakSet<object>();

/**
 * Marks an error as a session expiry signal while keeping the error itself, so that it can be
 * rethrown to the caller as-is when the session cannot be recovered.
 */
export const asSessionExpiredError = <T extends object>(error: T): T => {
    _sessionExpiredErrors.add(error);
    return error;
};

export const isSessionExpiredError = (error: unknown) => error === ERR_SESSION_EXPIRED || _sessionExpiredErrors.has(error as object);
