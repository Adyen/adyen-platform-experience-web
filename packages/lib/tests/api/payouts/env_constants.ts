import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config({ path: './envs/.env' });

const SESSION_ROLES = ['Transactions Overview Component: View', 'Payouts Overview Component: View'];

export const SESSION = {
    accountHolder: process.env.SESSION_ACCOUNT_HOLDER,
    roles: SESSION_ROLES,
    url: process.env.SESSION_API_URL,
    api_key: process.env.API_KEY,
};

const LIVE = {
    balanceAccountId: process.env.BALANCE_ACCOUNT,
    createdSince: '2024-05-14T00:00:00.000Z',
    createdUntil: '2024-06-19T00:00:00.000Z',
    payoutCreationDate: '2024-05-14T00:00:00.000Z',
    payouts_list_response: {
        fundsCapturedAmount: {
            value: 0,
            currency: 'USD',
        },
        adjustmentAmount: {
            value: 0,
            currency: 'USD',
        },
        payoutAmount: {
            value: 47,
            currency: 'USD',
        },
        unpaidAmount: {
            value: -47,
            currency: 'USD',
        },
        createdAt: '2024-05-14T11:40:13.000+00:00',
    },
    payout_details_response: {
        payout: {
            fundsCapturedAmount: {
                value: 0,
                currency: 'USD',
            },
            adjustmentAmount: {
                value: 0,
                currency: 'USD',
            },
            payoutAmount: {
                value: 47,
                currency: 'USD',
            },
            unpaidAmount: {
                value: -47,
                currency: 'USD',
            },
            createdAt: '2024-05-14T11:40:13.000+00:00',
        },
        amountBreakdowns: {
            fundsCapturedBreakdown: [],
            adjustmentBreakdown: [],
        },
    },
};

const TEST = {
    balanceAccountId: process.env.BALANCE_ACCOUNT,
    createdSince: '2024-04-16T00:00:00.000Z',
    createdUntil: '2024-06-19T00:00:00.000Z',
    payoutCreationDate: '2024-05-27T00:00:00.000Z',
    payouts_list_response: {
        fundsCapturedAmount: {
            value: 0,
            currency: 'USD',
        },
        adjustmentAmount: {
            value: 1000,
            currency: 'USD',
        },
        payoutAmount: {
            value: 1000,
            currency: 'USD',
        },
        unpaidAmount: {
            value: 0,
            currency: 'USD',
        },
        createdAt: '2024-05-27T15:15:05.000+00:00',
    },
    payout_details_response: {
        payout: {
            fundsCapturedAmount: {
                value: 0,
                currency: 'USD',
            },
            adjustmentAmount: {
                value: 1000,
                currency: 'USD',
            },
            payoutAmount: {
                value: 1000,
                currency: 'USD',
            },
            unpaidAmount: {
                value: 0,
                currency: 'USD',
            },
            createdAt: '2024-05-27T15:15:05.000+00:00',
        },
        amountBreakdowns: {
            fundsCapturedBreakdown: [],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: 1000,
                        currency: 'USD',
                    },
                    category: 'transfer',
                },
            ],
        },
    },
};

export const ENVS = {
    live: LIVE,
    test: TEST,
};
