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
        sessions: `/api/authe/api/v1/sessions`,
        setup: `${baseUrl}/setup`,
        sendEngageEvent: `${baseUrl}/uxdsclient/engage`,
        sendTrackEvent: `${baseUrl}/uxdsclient/track`,
        reports: `${baseUrl}/reports`,
        downloadReport: `${baseUrl}/reports/download`,
        stores: `${baseUrl}/stores`,
        currencies: `${baseUrl}/currencies`,
        countries: `${baseUrl}/countries`,
        capital: {
            createOffer: `${baseUrl}/capital/grantOffers/create`,
            dynamicOfferConfig: `${baseUrl}/capital/grantOffers/dynamic/configuration`,
            dynamicOffer: `${baseUrl}/capital/grantOffers/dynamic`,
            grants: `${baseUrl}/capital/grants`,
            requestFunds: `${baseUrl}/capital/grants/${matchVariable}`,
            signToS: `${baseUrl}/capital/grants/missingActions/signToS`,
            anaCredit: `${baseUrl}/capital/grants/missingActions/anaCredit`,
        },
        disputes: {
            list: `${baseUrl}/disputes`,
            details: `${baseUrl}/disputes/${matchVariable}`,
            accept: `${baseUrl}/disputes/${matchVariable}/accept`,
            defend: `${baseUrl}/disputes/${matchVariable}/defend`,
            documents: `${baseUrl}/disputes/${matchVariable}/documents`,
            download: `${baseUrl}/disputes/${matchVariable}/documents/download`,
        },
        payByLink: {
            configuration: `${baseUrl}/paybylink/paymentLinks/:storeId/configuration`,
            getPayByLinkSettings: `${baseUrl}/paybylink/settings/:storeId`,
            installments: `${baseUrl}/paybylink/installments`,
            paymentLinks: `${baseUrl}/paybylink/paymentLinks`,
        },
    } as const;
};
