import { boolOrFalse } from '../../../utils';

export const SETUP_ENDPOINT_PATH = '/setup';
export const AUTO_REFRESH = boolOrFalse(process.env.SESSION_AUTO_REFRESH);

export const MAX_AGE_MS = (() => {
    // Value provisioned in `SESSION_MAX_AGE_MS` env variable
    let maxAgeMs = ~~process.env.SESSION_MAX_AGE_MS!;

    if (Number.isFinite(maxAgeMs) && (maxAgeMs = Math.max(0, ~~maxAgeMs))) {
        return maxAgeMs;
    }
})();
