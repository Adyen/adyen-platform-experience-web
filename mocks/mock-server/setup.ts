import { rest } from 'msw';
import { endpoints } from '../../playground/endpoints/endpoints';
import { delay } from './utils';

const networkError = false;
const path = endpoints('mock').setup;

export const setupMock = [
    rest.post(path, (req, res, ctx) => {
        if (networkError) {
            return res.networkError('Failed to connect');
        }
        return res(
            delay(200),
            ctx.json({
                endpoints: {
                    getBalanceAccounts: {
                        method: 'GET',
                        url: 'balanceAccounts',
                    },
                    getBalances: {
                        method: 'GET',
                        url: 'balanceAccounts/{balanceAccountId}/balances',
                    },
                    getTransactions: {
                        method: 'GET',
                        url: 'transactions',
                    },
                    getTransaction: {
                        method: 'GET',
                        url: 'transactions/{transactionId}',
                    },
                    getTransactionTotals: {
                        method: 'GET',
                        url: 'transactions/totals',
                    },
                    getPayout: {
                        method: 'GET',
                        url: 'payouts/breakdown',
                    },
                    getPayouts: {
                        method: 'GET',
                        url: 'payouts',
                    },
                    getReports: {
                        method: 'GET',
                        url: 'reports',
                    },
                    downloadReport: {
                        method: 'GET',
                        url: 'reports/download',
                    },
                },
            })
        );
    }),
];
