import { boolOrFalse } from '../../../utils';

export const SETUP_ENDPOINT_PATH = '/setup';

export const SETUP_ENDPOINTS_API_VERSIONS: Record<string, number> = {
    getTransaction: 2,
    getTransactions: 2,
    getTransactionTotals: 2,
    downloadTransactions: 2,
} as const;

export const AUTO_REFRESH = boolOrFalse(process.env.SESSION_AUTO_REFRESH);

export const MAX_AGE_MS = (() => {
    const value = Number(process.env.SESSION_MAX_AGE_MS);
    return Number.isFinite(value) ? Math.max(0, value) : undefined;
})();
