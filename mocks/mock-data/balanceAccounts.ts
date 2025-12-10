import type { IBalance, IBalanceAccountBase } from '../../src';

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
        // One more balance account (without description) for completeness
        id: 'BA32272223222B5CTDQPM6W2K',
        timeZone: 'America/Sao_Paulo',
        defaultCurrencyCode: 'USD',
    },
] as const;

export const BALANCES: Record<string, IBalance[]> = {
    [BALANCE_ACCOUNTS[0].id]: [
        {
            value: 350000,
            reservedValue: 17500,
            currency: 'USD',
        },
        {
            value: 21000,
            reservedValue: 3000,
            currency: 'EUR',
        },
    ],
    [BALANCE_ACCOUNTS[1].id]: [
        {
            value: 10750,
            reservedValue: 675,
            currency: 'USD',
        },
        {
            value: 204825,
            reservedValue: 20550,
            currency: 'EUR',
        },
    ],
    [BALANCE_ACCOUNTS[2].id]: [
        {
            value: 5250,
            reservedValue: 0,
            currency: 'USD',
        },
    ],
};

export const BALANCE_ACCOUNTS_SINGLE = [BALANCE_ACCOUNTS[0]];
