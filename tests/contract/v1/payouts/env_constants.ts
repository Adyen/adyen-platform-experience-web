import { SuccessResponse } from '../../../../src/types/api/endpoints';
import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config({ path: './envs/.env' });

interface PayoutsVariables {
    balanceAccountId: string;
    createdSince: string;
    createdUntil: string;
    payoutCreationDate: string;
    payouts_list_response: SuccessResponse<'getPayouts'>['data'];
    payout_details_response: SuccessResponse<'getPayout'>;
}

const LIVE: PayoutsVariables = {
    balanceAccountId: process.env.BALANCE_ACCOUNT || '',
    createdSince: '2024-05-14T00:00:00.000Z',
    createdUntil: '2024-06-19T00:00:00.000Z',
    payoutCreationDate: '2024-05-14T00:00:00.000Z',
    payouts_list_response: [
        {
            fundsCapturedAmount: {
                value: 0,
                currency: 'USD',
            },
            adjustmentAmount: {
                value: 0,
                currency: 'USD',
            },
            payoutAmount: {
                value: 97,
                currency: 'USD',
            },
            unpaidAmount: {
                value: -97,
                currency: 'USD',
            },
            createdAt: '2024-05-14T00:00:00.000+00:00',
        },
    ],
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
                value: 97,
                currency: 'USD',
            },
            unpaidAmount: {
                value: -97,
                currency: 'USD',
            },
            createdAt: '2024-05-14T00:00:00.000+00:00',
        },
        amountBreakdowns: {
            fundsCapturedBreakdown: [],
            adjustmentBreakdown: [],
        },
    },
};

const TEST: PayoutsVariables = {
    balanceAccountId: process.env.BALANCE_ACCOUNT || '',
    createdSince: '2024-12-03T23:00:00.000Z',
    createdUntil: '2025-01-02T12:19:23.000Z',
    payoutCreationDate: '2025-08-13T00:00:00.000Z',
    payouts_list_response: [
        {
            fundsCapturedAmount: {
                value: 5270,
                currency: 'EUR',
            },
            adjustmentAmount: {
                value: -2650,
                currency: 'EUR',
            },
            payoutAmount: {
                value: 2620,
                currency: 'EUR',
            },
            unpaidAmount: {
                value: 0,
                currency: 'EUR',
            },
            createdAt: '2024-12-11T00:00:00.000+00:00',
        },
        {
            fundsCapturedAmount: {
                value: 7750,
                currency: 'EUR',
            },
            adjustmentAmount: {
                value: -14071,
                currency: 'EUR',
            },
            payoutAmount: {
                value: 3875,
                currency: 'EUR',
            },
            unpaidAmount: {
                value: -10196,
                currency: 'EUR',
            },
            createdAt: '2024-12-10T00:00:00.000+00:00',
        },
    ],
    payout_details_response: {
        payout: {
            fundsCapturedAmount: {
                value: 2539,
                currency: 'EUR',
            },
            adjustmentAmount: {
                value: -1394,
                currency: 'EUR',
            },
            payoutAmount: {
                value: 1145,
                currency: 'EUR',
            },
            unpaidAmount: {
                value: 0,
                currency: 'EUR',
            },
            createdAt: '2025-08-13T00:00:00.000+00:00',
        },
        amountBreakdowns: {
            fundsCapturedBreakdown: [
                {
                    amount: {
                        value: 5382,
                        currency: 'EUR',
                    },
                    category: 'capture',
                },
                {
                    amount: {
                        value: -2843,
                        currency: 'EUR',
                    },
                    category: 'refund',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1394,
                        currency: 'EUR',
                    },
                    category: 'grantRepayment',
                },
            ],
        },
    },
};

export const ENVS = {
    live: LIVE,
    test: TEST,
};
