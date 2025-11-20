import type { IBalanceAccountBase } from '../../src';

export const BALANCE_ACCOUNTS: IBalanceAccountBase[] = [
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
        // One more balance account (without description) for completeness
        id: 'BA32272223222B5CTDQPM6W2K',
        timeZone: 'America/Sao_Paulo',
        defaultCurrencyCode: 'USD',
    },
];

export const BALANCE_ACCOUNTS_SINGLE = [BALANCE_ACCOUNTS[0]];
