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
        getPayByLinkStores: {
            method: 'GET',
            url: 'stores',
            versions: [1],
        },
        getPayByLinkConfiguration: {
            method: 'GET',
            url: 'paybylink/paymentLinks/{storeId}/configuration',
            versions: [1],
        },
        getPaymentLinks: {
            method: 'GET',
            url: 'paybylink/paymentLinks',
            versions: [1],
        },
        getPayByLinkPaymentLinkById: {
            method: 'GET',
            url: 'paybylink/paymentLinks/{paymentLinkId}',
            versions: [1],
        },
        expirePayByLinkPaymentLink: {
            method: 'POST',
            url: 'paybylink/paymentLinks/{paymentLinkId}/expire',
            versions: [1],
        },
        payByLinkFilters: {
            method: 'GET',
            url: 'paybylink/filters',
            versions: [1],
        },
        createPBLPaymentLink: {
            method: 'POST',
            url: 'paybylink/paymentLinks',
            versions: [1],
        },
        getPayByLinkTheme: {
            method: 'GET',
            url: 'paybylink/themes/{storeId}',
            versions: [1],
        },
        updatePayByLinkTheme: {
            method: 'POST',
            url: 'paybylink/themes/{storeId}',
            versions: [1],
        },
        currencies: {
            method: 'GET',
            url: 'paybylink/currencies',
            versions: [1],
        },
        countries: {
            method: 'GET',
            url: 'paybylink/countries',
            versions: [1],
        },
        getPayByLinkSettings: {
            method: 'GET',
            url: 'paybylink/settings/{storeId}',
            versions: [1],
        },
        savePayByLinkSettings: {
            method: 'POST',
            url: 'paybylink/settings/{storeId}',
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
