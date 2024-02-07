import { rest } from 'msw';
import { endpoints } from '../endpoints';

const PREFIX = endpoints.setup;

export const setupMock = [
    rest.post(`${PREFIX}`, (req, res, ctx) => {
        return res(
            ctx.json({
                endpoints: {
                    getBalance: {
                        method: 'GET',
                        url: 'balanceAccounts/{balanceAccountId}/balances',
                    },
                    getTransactions: {
                        method: 'GET',
                        url: 'balanceAccounts/{balanceAccountId}/transactions',
                    },
                    getTransactionTotals: {
                        method: 'GET',
                        url: 'balanceAccounts/{balanceAccountId}/transactions/totals',
                    },
                    getBalanceAccounts: {
                        method: 'GET',
                        url: 'balanceAccounts',
                    },
                    getTransaction: {
                        method: 'GET',
                        url: 'balanceAccounts/transactions/{transactionId}',
                    },
                },
            })
        );
    }),
];
