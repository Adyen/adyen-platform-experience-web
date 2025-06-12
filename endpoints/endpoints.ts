export const endpoints = (mode: 'netlify' | 'viteDev' | 'mock') => {
    const matchVariable = mode === 'netlify' ? '(.*)' : ':id';
    const prefix = mode === 'viteDev' ? '^' : 'https://platform-components-external-test.adyen.com/platform-components-external/api';
    const baseUrl = prefix + '/v([0-9]+)';

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
        reports: `${baseUrl}/reports`,
        downloadReport: `${baseUrl}/reports/download`,
        capital: {
            createOffer: `${baseUrl}/capital/grantOffers/create`,
            dynamicOfferConfig: `${baseUrl}/capital/grantOffers/dynamic/configuration`,
            dynamicOffer: `${baseUrl}/capital/grantOffers/dynamic`,
            grants: `${baseUrl}/capital/grants`,
            requestFunds: `${baseUrl}/capital/grants/${matchVariable}`,
            signToS: `${baseUrl}/capital/grants/missingActions/signToS`,
            anacredit: `${baseUrl}/capital/grants/missingActions/anacredit`,
        },
    } as const;
};
