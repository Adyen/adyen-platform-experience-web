import { http, HttpResponse } from 'msw';
import { endpoints } from '../../endpoints/endpoints';
import { delay } from './utils';

const networkError = false;
const path = endpoints('mock').setup;

export const setupMock = [
    http.post(path, async () => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(200);
        return HttpResponse.json({
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
                refundTransaction: {
                    method: 'POST',
                    url: 'transactions/{transactionId}/refund',
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
        });
    }),
];
