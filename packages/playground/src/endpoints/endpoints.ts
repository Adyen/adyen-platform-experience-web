export const endpoints = (mode: string) => {
    const matchVariable = mode === 'netlify' ? '(.*)' : ':id';
    const prefix = mode === 'viteDev' ? '^' : 'https://platform-components-external-test.adyen.com/platform-components-external/api';

    return {
        balanceAccounts: `${prefix}/v([0-9]+)/balanceAccounts`,
        balances: `${prefix}/v([0-9]+)/balanceAccounts/${matchVariable}/balances`,
        transactions: `${prefix}/v([0-9]+)/transactions`,
        transaction: `${prefix}/v([0-9]+)/transactions/${matchVariable}`,
        transactionsTotals: `${prefix}/v([0-9]+)/transactions/totals`,
        sessions: `\/api/authe/api/v1/sessions`,
        setup: `${prefix}/v([0-9]+)/setup`,
    };
};
