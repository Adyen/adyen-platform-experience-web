import { boolOrFalse } from '../../../utils';
import { EndpointName } from '../../../types/api/endpoints';
import { HttpOptions } from '../../Http/types';

export const SETUP_ENDPOINTS_API_VERSIONS: Partial<Record<EndpointName, HttpOptions['apiVersion']>> = {
    // getTransactionV2: 2,
    // getTransactionsV2: 2,
    // getTransactionTotalsV2: 2,
} as const;

export const SETUP_ENDPOINT_PATH = '/setup';
export const AUTO_REFRESH = boolOrFalse(process.env.SESSION_AUTO_REFRESH);

export const MAX_AGE_MS = (() => {
    // Value provisioned in `SESSION_MAX_AGE_MS` env variable
    let maxAgeMs = ~~process.env.SESSION_MAX_AGE_MS!;

    if (Number.isFinite(maxAgeMs) && (maxAgeMs = Math.max(0, ~~maxAgeMs))) {
        return maxAgeMs;
    }
})();
