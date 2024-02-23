export const endpoints = mode => {
    const matchVariable = mode === 'prod' ? '(.*)' : ':id';
    const prefix = mode === 'viteDev' ? '^' : '';
    return {
        balanceAccount: `${prefix}\/api\/v([0-9]+)/balanceAccounts`,
        balanceAccountTotals: `${prefix}\/api\/v([0-9]+)/balanceAccounts/${matchVariable}/transactions/totals`,
        balances: `${prefix}\/api\/v([0-9]+)/balanceAccounts/${matchVariable}/balances`,
        transactions: `${prefix}\/api\/v([0-9]+)/balanceAccounts/${matchVariable}/transactions`,
        transaction: `${prefix}\/api\/v([0-9]+)/balanceAccounts/transactions/${matchVariable}`,
        sessions: `${prefix}\/api\/authe/api/v1/sessions`,
        setup: `${prefix}\/api\/v([0-9]+)/setup`,
    };
};
