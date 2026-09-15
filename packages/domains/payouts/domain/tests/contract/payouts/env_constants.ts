import { SuccessResponse } from '@integration-components/types/api/endpoints';
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
    createdSince: '2026-01-01T00:00:00.000Z',
    createdUntil: '2026-08-01T00:00:00.000Z',
    payoutCreationDate: '2026-07-31T00:00:00.000Z',
    payouts_list_response: [
        {
            fundsCapturedAmount: {
                value: 225116,
                currency: 'EUR',
            },
            adjustmentAmount: {
                value: 0,
                currency: 'EUR',
            },
            payoutAmount: {
                value: 225116,
                currency: 'EUR',
            },
            unpaidAmount: {
                value: 0,
                currency: 'EUR',
            },
            createdAt: '2026-07-31T00:00:00.000+00:00',
        },
    ],
    payout_details_response: {
        payout: {
            fundsCapturedAmount: {
                value: 225116,
                currency: 'EUR',
            },
            adjustmentAmount: {
                value: 0,
                currency: 'EUR',
            },
            payoutAmount: {
                value: 225116,
                currency: 'EUR',
            },
            unpaidAmount: {
                value: 0,
                currency: 'EUR',
            },
            createdAt: '2026-07-31T00:00:00.000+00:00',
        },
        amountBreakdowns: {
            fundsCapturedBreakdown: [
                {
                    amount: {
                        value: -56665,
                        currency: 'EUR',
                    },
                    category: 'chargeback',
                },
                {
                    amount: {
                        value: 363458,
                        currency: 'EUR',
                    },
                    category: 'capture',
                },
                {
                    amount: {
                        value: -81677,
                        currency: 'EUR',
                    },
                    category: 'refund',
                },
            ],
            adjustmentBreakdown: [],
        },
    },
};

export const ENVS = {
    live: LIVE,
    test: TEST,
};
