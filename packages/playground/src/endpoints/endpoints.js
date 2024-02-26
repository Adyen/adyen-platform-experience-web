export const endpoints = mode => {
    const matchVariable = mode === 'netlify' ? '(.*)' : ':id';
    const prefix = mode === 'viteDev' ? '^' : 'https://platform-components-external-test.adyen.com/platform-components-external/api';

    return {
        balanceAccount: `${prefix}/v([0-9]+)/balanceAccounts`,
        balanceAccountTotals: `${prefix}/v([0-9]+)/balanceAccounts/${matchVariable}/transactions/totals`,
        balances: `${prefix}/v([0-9]+)/balanceAccounts/${matchVariable}/balances`,
        transactions: `${prefix}\/v([0-9]+)/balanceAccounts/${matchVariable}/transactions`,
        transaction: `${prefix}/v([0-9]+)/balanceAccounts/transactions/${matchVariable}`,
        sessions: `/authe/api/v1/sessions`,
        setup: `${prefix}/v([0-9]+)/setup`,
    };
};

// https://platform-components-external-test.adyen.com/platform-components-external/api/v1/balanceAccounts/BA32272223222B5CTDNB66W2Z/transactions/totals
