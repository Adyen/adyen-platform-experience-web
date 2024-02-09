import { rest } from 'msw';
import { endpoints } from '../endpoints';

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
];

export const balanceAccountMock = [
    rest.get(endpoints.balanceAccount, (req, res, ctx) => {
        return res(
            ctx.delay(300),
            ctx.json({
                balanceAccounts: MULTIPLE_BALANCE_ACCOUNTS,
            })
        );
    }),
    rest.get(endpoints.balanceAccountTotals, (req, res, ctx) => {
        return res(
            ctx.delay(300),
            ctx.json({
                totals: [
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
                ],
            })
        );
    }),
];
