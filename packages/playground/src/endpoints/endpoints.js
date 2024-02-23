const baseEndpoints = {
    balanceAccount: '/balanceAccounts',
    balanceAccountTotals: '/balanceAccounts/:id/transactions/totals',
    balances: '/balanceAccounts/:id/balances',
    transactions: '/balanceAccounts/:id/transactions',
    transaction: '/balanceAccounts/transactions/:id',
    sessions: '/authe/api/v1/sessions',
    setup: '/setup',
};

const getter = {
    get(target, name) {
        return name === 'sessions' ? `/api${target['sessions']}` : `^\/api\/v([0-9]+)${target[name]}`;
    },
};

const mockEndpointsGetter = {
    get(target, name) {
        return name === 'sessions' ? `/api${target['sessions']}` : `\/api\/v([0-9]+)${target[name]}`;
    },
};

export const endpoints = new Proxy(baseEndpoints, getter);
export const mockEndpoints = new Proxy(baseEndpoints, mockEndpointsGetter);
