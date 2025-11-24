import { http, HttpResponse } from 'msw';
import { endpoints } from '../../endpoints/endpoints';
import { delay } from './utils/utils';
import { EndpointName } from '../../src/types/api/endpoints';
import { HttpMethod } from '../../src/core/Http/types';

const networkError = false;
const path = endpoints('mock').setup;

export const setupBasicResponse = {
    endpoints: {
        sendTrackEvent: {
            method: 'POST',
            url: 'uxdsclient/track',
            versions: [1],
        },
        sendEngageEvent: {
            method: 'POST',
            url: 'uxdsclient/engage',
            versions: [1],
        },
        getBalanceAccounts: {
            method: 'GET',
            url: 'balanceAccounts',
            versions: [1],
        },
        getBalances: {
            method: 'GET',
            url: 'balanceAccounts/{balanceAccountId}/balances',
            versions: [1],
        },
        getTransactions: {
            method: 'GET',
            url: 'transactions',
            versions: [1, 2],
        },
        getTransaction: {
            method: 'GET',
            url: 'transactions/{transactionId}',
            versions: [1, 2],
        },
        initiateRefund: {
            method: 'POST',
            url: 'transactions/{transactionId}/refund',
            versions: [1],
        },
        getTransactionTotals: {
            method: 'GET',
            url: 'transactions/totals',
            versions: [1, 2],
        },
        downloadTransactions: {
            method: 'GET',
            url: 'transactions/download',
            versions: [1],
        },
        getPayout: {
            method: 'GET',
            url: 'payouts/breakdown',
            versions: [1],
        },
        getPayouts: {
            method: 'GET',
            url: 'payouts',
            versions: [1],
        },
        getReports: {
            method: 'GET',
            url: 'reports',
            versions: [1],
        },
        downloadReport: {
            method: 'GET',
            url: 'reports/download',
            versions: [1],
        },
        getGrants: {
            method: 'GET',
            url: 'capital/grants',
            versions: [1],
        },
        getDynamicGrantOffersConfiguration: {
            method: 'GET',
            url: 'capital/grantOffers/dynamic/configuration',
            versions: [1],
        },
        createGrantOffer: {
            method: 'POST',
            url: 'capital/grantOffers/create',
            versions: [1],
        },
        getDynamicGrantOffer: {
            method: 'GET',
            url: 'capital/grantOffers/dynamic',
            versions: [1],
        },
        requestFunds: {
            method: 'POST',
            url: 'capital/grants/{grantOfferId}',
            versions: [1],
        },
        signToSActionDetails: {
            method: 'GET',
            url: 'capital/grants/missingActions/signToS',
            versions: [1],
        },
        getDisputeList: {
            method: 'GET',
            url: 'disputes',
            versions: [1],
        },
        getDisputeDetail: {
            method: 'GET',
            url: 'disputes/{disputePspReference}',
            versions: [1],
        },
        getApplicableDefenseDocuments: {
            method: 'GET',
            url: 'disputes/{disputePspReference}/documents',
            versions: [1],
        },
        acceptDispute: {
            method: 'POST',
            url: 'disputes/{disputePspReference}/accept',
            versions: [1],
        },
        defendDispute: {
            method: 'POST',
            url: 'disputes/{disputePspReference}/defend',
            versions: [1],
        },
        downloadDefenseDocument: {
            method: 'GET',
            url: 'disputes/{disputePspReference}/documents/download',
            versions: [1],
        },
        anaCreditActionDetails: {
            method: 'GET',
            url: 'capital/grants/missingActions/anaCredit',
            versions: [1],
        },
    } satisfies Record<EndpointName, { method: HttpMethod; url: string; versions: number[] }>,
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
