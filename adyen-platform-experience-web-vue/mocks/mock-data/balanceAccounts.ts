import type { IBalanceAccountBase } from '../../src/types';

export const BALANCE_ACCOUNTS: readonly IBalanceAccountBase[] = [
    {
        description: 'John Doe - Main Account',
        id: 'BA32272223222B5CTDQPM6W2H',
        timeZone: 'America/Sao_Paulo',
        defaultCurrencyCode: 'USD',
    },
    {
        description: 'Jane Smith - Secondary Account',
        id: 'BA32272223222B5CTDQPM6W2G',
        timeZone: 'America/Sao_Paulo',
        defaultCurrencyCode: 'EUR',
    },
    {
        id: 'BA32272223222B5CTDQPM6W2K',
        timeZone: 'America/Sao_Paulo',
        defaultCurrencyCode: 'USD',
    },
] as const;
