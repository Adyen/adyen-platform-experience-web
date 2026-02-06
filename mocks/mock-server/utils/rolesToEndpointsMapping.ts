import { HttpMethod } from '../../../src/core/Http/types';

export const AnalyticsEndpoints = {
    sendEngageEvent: {
        method: 'POST' as HttpMethod,
        url: 'uxdsclient/engage',
        versions: [1],
    },
    sendTrackEvent: {
        method: 'POST' as HttpMethod,
        url: 'uxdsclient/track',
        versions: [1],
    },
};

export const TransactionsOverviewComponentView = {
    getBalanceAccounts: {
        method: 'GET' as HttpMethod,
        url: 'balanceAccounts',
        versions: [1],
    },
    getBalances: {
        method: 'GET' as HttpMethod,
        url: 'balanceAccounts/{balanceAccountId}/balances',
        versions: [1],
    },
    getTransaction: {
        method: 'GET' as HttpMethod,
        url: 'transactions/{transactionId}',
        versions: [1, 2],
    },
    getTransactionTotals: {
        method: 'GET' as HttpMethod,
        url: 'transactions/totals',
        versions: [1, 2],
    },
    getTransactions: {
        method: 'GET' as HttpMethod,
        url: 'transactions',
        versions: [1, 2],
    },
    downloadTransactions: {
        method: 'GET' as HttpMethod,
        url: 'transactions/download',
        versions: [1, 2],
    },
    ...AnalyticsEndpoints,
};

export const TransactionsOverviewComponentManageRefunds = {
    ...TransactionsOverviewComponentView,
    initiateRefund: {
        method: 'POST',
        url: 'transactions/{transactionId}/refund',
        versions: [1],
    },
};

export const ReportsOverviewComponentView = {
    downloadReport: {
        method: 'GET' as HttpMethod,
        url: 'reports/download',
        versions: [1],
    },
    getBalanceAccounts: {
        method: 'GET' as HttpMethod,
        url: 'balanceAccounts',
        versions: [1],
    },
    getReports: {
        method: 'GET' as HttpMethod,
        url: 'reports',
        versions: [1],
    },
    ...AnalyticsEndpoints,
};

export const PayoutsOverviewComponentView = {
    getBalanceAccounts: {
        method: 'GET' as HttpMethod,
        url: 'balanceAccounts',
        versions: [1],
    },
    getPayout: {
        method: 'GET' as HttpMethod,
        url: 'payouts/breakdown',
        versions: [1],
    },
    getPayouts: {
        method: 'GET' as HttpMethod,
        url: 'payouts',
        versions: [1],
    },
    ...AnalyticsEndpoints,
};

export const CapitalComponentManage = {
    anaCreditActionDetails: {
        method: 'GET' as HttpMethod,
        url: 'capital/grants/missingActions/anaCredit',
        versions: [1],
    },
    createGrantOffer: {
        method: 'POST' as HttpMethod,
        url: 'capital/grantOffers/create',
        versions: [1],
    },
    getDynamicGrantOffer: {
        method: 'GET' as HttpMethod,
        url: 'capital/grantOffers/dynamic',
        versions: [1],
    },
    getDynamicGrantOffersConfiguration: {
        method: 'GET' as HttpMethod,
        url: 'capital/grantOffers/dynamic/configuration',
        versions: [1],
    },
    getGrants: {
        method: 'GET' as HttpMethod,
        url: 'capital/grants',
        versions: [1],
    },
    getOnboardingConfiguration: {
        method: 'GET' as HttpMethod,
        url: 'capital/onboardingConfiguration',
        versions: [1],
    },
    requestFunds: {
        method: 'POST' as HttpMethod,
        url: 'capital/grants/{grantOfferId}',
        versions: [1],
    },
    signToSActionDetails: {
        method: 'GET' as HttpMethod,
        url: 'capital/grants/missingActions/signToS',
        versions: [1],
    },
    ...AnalyticsEndpoints,
};

export const DisputesComponentManage = {
    acceptDispute: {
        method: 'POST' as HttpMethod,
        url: 'disputes/{disputePspReference}/accept',
        versions: [1],
    },
    defendDispute: {
        method: 'POST' as HttpMethod,
        url: 'disputes/{disputePspReference}/defend',
        versions: [1],
    },
    downloadDefenseDocument: {
        method: 'GET' as HttpMethod,
        url: 'disputes/{disputePspReference}/documents/download',
        versions: [1],
    },
    getApplicableDefenseDocuments: {
        method: 'GET' as HttpMethod,
        url: 'disputes/{disputePspReference}/documents',
        versions: [1],
    },
    getBalanceAccounts: {
        method: 'GET' as HttpMethod,
        url: 'balanceAccounts',
        versions: [1],
    },
    getDisputeDetail: {
        method: 'GET' as HttpMethod,
        url: 'disputes/{disputePspReference}',
        versions: [1],
    },
    getDisputeList: {
        method: 'GET' as HttpMethod,
        url: 'disputes',
        versions: [1],
    },
    ...AnalyticsEndpoints,
};

export const PayByLinkComponentView = {
    getPaymentLinks: {
        method: 'GET' as HttpMethod,
        url: 'paybylink/paymentLinks',
        versions: [1],
    },
    getPayByLinkStores: {
        method: 'GET' as HttpMethod,
        url: 'stores',
        versions: [1],
    },
    payByLinkFilters: {
        method: 'GET' as HttpMethod,
        url: 'paybylink/filters',
        versions: [1],
    },
    getPayByLinkPaymentLinkById: {
        method: 'GET' as HttpMethod,
        url: 'paybylink/paymentLinks/{paymentLinkId}',
        versions: [1],
    },
    ...AnalyticsEndpoints,
};

export const PayByLinkComponentManageLinks = {
    ...PayByLinkComponentView,
    countries: {
        method: 'GET' as HttpMethod,
        url: 'paybylink/countries',
        versions: [1],
    },
    currencies: {
        method: 'GET' as HttpMethod,
        url: 'paybylink/currencies',
        versions: [1],
    },
    expirePayByLinkPaymentLink: {
        method: 'POST' as HttpMethod,
        url: 'paybylink/paymentLinks/{paymentLinkId}/expire',
        versions: [1],
    },
    getPayByLinkSettings: {
        method: 'GET' as HttpMethod,
        url: 'paybylink/settings/{storeId}',
        versions: [1],
    },
    createPBLPaymentLink: {
        method: 'POST' as HttpMethod,
        url: 'paybylink/paymentLinks',
        versions: [1],
    },
    getPayByLinkConfiguration: {
        method: 'GET' as HttpMethod,
        url: 'paybylink/paymentLinks/{storeId}/configuration',
        versions: [1],
    },
    ...AnalyticsEndpoints,
};

export const PayByLinkComponentManageSettings = {
    getPayByLinkStores: {
        method: 'GET' as HttpMethod,
        url: 'stores',
        versions: [1],
    },
    getPayByLinkSettings: {
        method: 'GET' as HttpMethod,
        url: 'paybylink/settings/{storeId}',
        versions: [1],
    },
    savePayByLinkSettings: {
        method: 'POST' as HttpMethod,
        url: 'paybylink/settings/{storeId}',
        versions: [1],
    },
    getPayByLinkTheme: {
        method: 'GET' as HttpMethod,
        url: 'paybylink/themes/{storeId}',
        versions: [1],
    },
    updatePayByLinkTheme: {
        method: 'POST' as HttpMethod,
        url: 'paybylink/themes/{storeId}',
        versions: [1],
    },
    ...AnalyticsEndpoints,
};
