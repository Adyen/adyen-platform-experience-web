export const endpoints = mode => {
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
        transactionsTotals: `${baseUrl}/transactions/totals`,
        sessions: `/api/authe/api/v1/sessions`,
        setup: `${baseUrl}/setup`,
        reports: `${baseUrl}/reports`,
        downloadReport: `${baseUrl}/reports/download`,
        capital: {
            dynamicConfig: `${baseUrl}/capital/grantOffers/dynamic/configuration`,
            dynamicOffer: `${baseUrl}/capital/grantOffers/dynamic`,
            grantReview: `${baseUrl}/capital/grantOffers/review`,
            signOffer: `${baseUrl}/capital/grantOffers/dynamic/sign/${matchVariable}`,
            grants: `${baseUrl}/capital/grants`,
        },
    };
};
