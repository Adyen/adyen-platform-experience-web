import { rest } from 'msw';
import { endpoints } from '../endpoints';
import { delay } from '../utils/utils';

const networkError = false;
const PREFIX = endpoints('mock').setup;

export const setupMock = [
    rest.post(`${PREFIX}`, (req, res, ctx) => {
        if (networkError) {
            return res.networkError('Failed to connect');
        }
        return res(
            delay(200),
            ctx.json({
                endpoints: {
                    getBalances: {
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
