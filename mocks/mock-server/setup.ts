import { http, HttpResponse } from 'msw';
import { endpoints } from '../../endpoints/endpoints';
import { delay } from './utils';
import { EndpointName } from '../../src/types/api/endpoints';
import { HttpMethod } from '../../src/core/Http/types';

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
                getGrants: {
                    method: 'GET',
                    url: 'capital/grants',
                },
                getCapitalDynamicConfiguration: {
                    method: 'GET',
                    url: 'capital/grantOffers/dynamic/configuration',
                },
            } satisfies Record<EndpointName, { method: HttpMethod; url: string }>,
        });
    }),
];
