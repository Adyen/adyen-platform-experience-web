export const ERR_SETUP_ABORTED: unique symbol = Symbol('Error<AUTH_SETUP_ABORTED>');
export const ERR_SETUP_FAILED: unique symbol = Symbol('Error<AUTH_SETUP_FAILED>');
export const EVT_SETUP_INIT = 'auth:setupInit';
export const SETUP_ENDPOINT_PATH = '/setup';

export const MAX_AGE_MS = (() => {
    // Value provisioned in `SESSION_MAX_AGE_MS` env variable
    let maxAgeMs = ~~process.env.SESSION_MAX_AGE_MS!;

    if (Number.isFinite(maxAgeMs) && (maxAgeMs = Math.max(0, ~~maxAgeMs))) {
        return maxAgeMs;
    }
})();
