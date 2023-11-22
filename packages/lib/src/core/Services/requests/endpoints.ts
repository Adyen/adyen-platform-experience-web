import { FunctionOrStringLiteral } from '@src/core/Services/requests/types';

export const API_ENDPOINTS = {
    transactions: {
        getTransactions: '/transactions',
        getTransactionsById: (id: string) => `/transactions/${id}`,
    },
} as const satisfies Record<string, Record<string, FunctionOrStringLiteral>>;
