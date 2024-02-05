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
    rest.post(endpoints.balanceAccount, (req, res, ctx) => {
        return res(
            ctx.json({
                balanceAccounts: MULTIPLE_BALANCE_ACCOUNTS,
            })
        );
    }),
];
