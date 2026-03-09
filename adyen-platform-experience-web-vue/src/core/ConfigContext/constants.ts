export const CONFIG_CONTEXT_KEY = Symbol('ConfigContext');
export const SETUP_ENDPOINT_PATH = '/setup';
export const API_VERSION = 'v1';

export const SETUP_ENDPOINTS_API_VERSIONS: Record<string, number> = {
    getTransaction: 2,
    getTransactions: 2,
    getTransactionTotals: 2,
    downloadTransactions: 2,
} as const;
