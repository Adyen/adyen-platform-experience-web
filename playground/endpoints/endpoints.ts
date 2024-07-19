export const endpoints = (mode: string) => {
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
    };
};
