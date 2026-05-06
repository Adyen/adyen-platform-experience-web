import type { IBalanceAccountBase } from '@integration-components/types';

export const BALANCE_ACCOUNTS: readonly [IBalanceAccountBase, IBalanceAccountBase, IBalanceAccountBase] = [
    {
        description: 'S. Hopper - Main Account',
        id: 'BA32272223222B5CTDQPM6W2H',
        timeZone: 'America/Sao_Paulo',
        defaultCurrencyCode: 'USD',
    },
    {
        description: 'S. Hopper - Secondary Account',
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

export const BALANCE_ACCOUNTS_SINGLE = [BALANCE_ACCOUNTS[0]];
