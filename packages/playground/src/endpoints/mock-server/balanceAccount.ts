import { rest } from 'msw';
import { endpoints } from '../endpoints';
import { delay } from '../utils/utils';

const mockEndpoints = endpoints('mock');

const SINGLE_BALANCE_ACCOUNT = [
    {
        description: 'S. Hopper - Main Account',
        id: 'BA32272223222B5CTDNB66W2Z',
        timeZone: 'Europe/Amsterdam',
        defaultCurrencyCode: 'EUR',
    },
];

const MULTIPLE_BALANCE_ACCOUNTS = [
    {
        description: 'S. Hopper - Main Account',
        id: 'BA32272223222B5CTDNB66W2Z',
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

const TRANSACTION_TOTALS = [
    {
        currency: 'EUR',
        incomings: 2892,
        expenses: -23484,
    },
    {
        currency: 'USD',
        incomings: 0,
        expenses: -20,
    },
];

const MULTIPLE_ACCOUNT_BALANCES = [
    {
        value: 12345,
        currency: 'EUR',
    },
    {
        value: 9876,
        currency: 'USD',
    },
];

export const balanceAccountMock = [
    rest.get(mockEndpoints.balanceAccount, (req, res, ctx) => {
        return res(
            delay(200),
            ctx.json({
                balanceAccounts: MULTIPLE_BALANCE_ACCOUNTS,
            })
        );
    }),
    rest.get(mockEndpoints.balanceAccountTotals, (req, res, ctx) => {
        return res(
            delay(300),
            ctx.json({
                totals: TRANSACTION_TOTALS,
            })
        );
    }),
    rest.get(mockEndpoints.balances, (req, res, ctx) => {
        return res(
            delay(300),
            ctx.json({
                balances: MULTIPLE_ACCOUNT_BALANCES,
            })
        );
    }),
];
