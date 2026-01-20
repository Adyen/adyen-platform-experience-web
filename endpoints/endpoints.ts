const baseUrl = 'https://platform-components-external-test.adyen.com/platform-components-external/api/v([0-9]+)';
const datasetBaseUrl = 'http://localhost:3030/src/assets/datasets';

export const endpoints = () =>
    ({
        balanceAccounts: `${baseUrl}/balanceAccounts`,
        balances: `${baseUrl}/balanceAccounts/:id/balances`,
        payouts: `${baseUrl}/payouts`,
        payout: `${baseUrl}/payouts/breakdown`,
        transactions: `${baseUrl}/transactions`,
        transaction: `${baseUrl}/transactions/:id`,
        initiateRefund: `${baseUrl}/transactions/:id/refund`,
        transactionsTotals: `${baseUrl}/transactions/totals`,
        downloadTransactions: `${baseUrl}/transactions/download`,
        sessions: '/api/authe/api/v1/sessions',
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
            requestFunds: `${baseUrl}/capital/grants/:id`,
            signToS: `${baseUrl}/capital/grants/missingActions/signToS`,
        },
        disputes: {
            accept: `${baseUrl}/disputes/:id/accept`,
            defend: `${baseUrl}/disputes/:id/defend`,
            details: `${baseUrl}/disputes/:id`,
            documents: `${baseUrl}/disputes/:id/documents`,
            download: `${baseUrl}/disputes/:id/documents/download`,
            list: `${baseUrl}/disputes`,
        },
        payByLink: {
            configuration: `${baseUrl}/paybylink/paymentLinks/:storeId/configuration`,
            countries: `${baseUrl}/paybylink/countries`,
            currencies: `${baseUrl}/paybylink/currencies`,
            details: `${baseUrl}/paybylink/paymentLinks/:id`,
            expire: `${baseUrl}/paybylink/paymentLinks/:id/expire`,
            filters: `${baseUrl}/paybylink/filters`,
            installments: `${baseUrl}/paybylink/installments`,
            list: `${baseUrl}/paybylink/paymentLinks`,
            settings: `${baseUrl}/paybylink/settings/:storeId`,
            themes: `${baseUrl}/paybylink/themes/:id`,
        },
        datasets: {
            countries: `${datasetBaseUrl}/countries/:locale.json?import`,
        },
    }) as const;
