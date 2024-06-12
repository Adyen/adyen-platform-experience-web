import type { IBalanceAccountBase } from '@adyen/adyen-platform-experience-web/src';

export const BALANCE_ACCOUNTS: IBalanceAccountBase[] = [
    {
        description: 'S. Hopper - Main Account',
        id: '1234567890123456',
        timeZone: 'Europe/Amsterdam',
        defaultCurrencyCode: 'EUR',
    },
    {
        description: 'S. Hopper - Secondary Account',
        id: 'BA32272223222B5CTDQPM6W2H',
        timeZone: 'America/Sao_Paulo',
        defaultCurrencyCode: 'BRL',
    },
    {
        description: 'S. Hopper - Third Account',
        id: 'BA32272223222B5CTDQPM6W2G',
        timeZone: 'America/Sao_Paulo',
        defaultCurrencyCode: 'BRL',
    },
];

export const BALANCE_ACCOUNTS_SINGLE = [BALANCE_ACCOUNTS[0]];
