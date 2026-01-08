export const endpoints = (mode: 'netlify' | 'mock') => {
    const baseUrl = 'https://platform-components-external-test.adyen.com/platform-components-external/api/v([0-9]+)';
    const matchVariable = mode === 'netlify' ? '(.*)' : ':id';

    return {
        balanceAccounts: `${baseUrl}/balanceAccounts`,
        balances: `${baseUrl}/balanceAccounts/${matchVariable}/balances`,
        payouts: `${baseUrl}/payouts`,
        payout: `${baseUrl}/payouts/breakdown`,
        transactions: `${baseUrl}/transactions`,
        transaction: `${baseUrl}/transactions/${matchVariable}`,
        initiateRefund: `${baseUrl}/transactions/${matchVariable}/refund`,
        transactionsTotals: `${baseUrl}/transactions/totals`,
        downloadTransactions: `${baseUrl}/transactions/download`,
        sessions: `/api/authe/api/v1/sessions`,
        setup: `${baseUrl}/setup`,
        sendEngageEvent: `${baseUrl}/uxdsclient/engage`,
        sendTrackEvent: `${baseUrl}/uxdsclient/track`,
        reports: `${baseUrl}/reports`,
        downloadReport: `${baseUrl}/reports/download`,
        stores: `${baseUrl}/stores`,
        capital: {
            anaCredit: `${baseUrl}/capital/grants/missingActions/anaCredit`,
            createOffer: `${baseUrl}/capital/grantOffers/create`,
            dynamicOfferConfig: `${baseUrl}/capital/grantOffers/dynamic/configuration`,
            dynamicOffer: `${baseUrl}/capital/grantOffers/dynamic`,
            grants: `${baseUrl}/capital/grants`,
            requestFunds: `${baseUrl}/capital/grants/${matchVariable}`,
            signToS: `${baseUrl}/capital/grants/missingActions/signToS`,
        },
        disputes: {
            accept: `${baseUrl}/disputes/${matchVariable}/accept`,
            defend: `${baseUrl}/disputes/${matchVariable}/defend`,
            details: `${baseUrl}/disputes/${matchVariable}`,
            documents: `${baseUrl}/disputes/${matchVariable}/documents`,
            download: `${baseUrl}/disputes/${matchVariable}/documents/download`,
            list: `${baseUrl}/disputes`,
        },
        payByLink: {
            configuration: `${baseUrl}/paybylink/paymentLinks/:storeId/configuration`,
            countries: `${baseUrl}/paybylink/countries`,
            currencies: `${baseUrl}/paybylink/currencies`,
            details: `${baseUrl}/paybylink/paymentLinks/${matchVariable}`,
            expire: `${baseUrl}/paybylink/paymentLinks/${matchVariable}/expire`,
            filters: `${baseUrl}/paybylink/filters`,
            installments: `${baseUrl}/paybylink/installments`,
            list: `${baseUrl}/paybylink/paymentLinks`,
            settings: `${baseUrl}/paybylink/settings/:storeId`,
            themes: `${baseUrl}/paybylink/themes/${matchVariable}`,
        },
    } as const;
};
