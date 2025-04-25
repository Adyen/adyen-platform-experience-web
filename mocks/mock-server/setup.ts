import { http, HttpResponse } from 'msw';
import { endpoints } from '../../endpoints/endpoints';
import { delay } from './utils/utils';
import { EndpointName } from '../../src/types/api/endpoints';
import { HttpMethod } from '../../src/core/Http/types';

const networkError = false;
const path = endpoints('mock').setup;

export const setupBasicResponse = {
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
        initiateRefund: {
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
        getGrants: {
            method: 'GET',
            url: 'capital/grants',
        },
        getDynamicGrantOffersConfiguration: {
            method: 'GET',
            url: 'capital/grantOffers/dynamic/configuration',
        },
        createGrantOffer: {
            method: 'POST',
            url: 'capital/grantOffers/create',
        },
        getDynamicGrantOffer: {
            method: 'GET',
            url: 'capital/grantOffers/dynamic',
        },
        requestFunds: {
            method: 'POST',
            url: 'capital/grants/{grantOfferId}',
        },
        signToSActionDetails: {
            method: 'GET',
            url: 'capital/grants/missingActions/signToS',
        },
        getDisputeList: {
            method: 'GET',
            url: 'disputes',
        },
        getDisputeDetail: {
            method: 'GET',
            url: 'disputes/{disputePspReference}',
        },
        getApplicableDefenseDocuments: {
            method: 'GET',
            url: 'disputes/{disputePspReference}/documents',
        },
        acceptDispute: {
            method: 'POST',
            url: 'disputes/{disputePspReference}/accept',
        },
        defendDispute: {
            method: 'POST',
            url: 'disputes/{disputePspReference}/defend',
        },
        downloadDisputeFile: {
            method: 'GET',
            url: 'disputes/{disputePspReference}/documents/download',
        },
    } satisfies Record<EndpointName, { method: HttpMethod; url: string }>,
};

export const setupMock = [
    http.post(path, async () => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(200);
        return HttpResponse.json({
            ...setupBasicResponse,
        });
    }),
];
