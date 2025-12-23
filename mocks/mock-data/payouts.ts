import type { IPayout, IPayoutDetails } from '../../src';

export const PAYOUTS_WITH_DETAILS: (IPayoutDetails & { balanceAccountId: string })[] = [
    {
        balanceAccountId: '1234567890123456',
        payout: {
            fundsCapturedAmount: {
                value: 100000,
                currency: 'EUR',
            },
            adjustmentAmount: {
                value: -10000,
                currency: 'EUR',
            },
            payoutAmount: {
                value: 90000,
                currency: 'EUR',
            },
            unpaidAmount: {
                value: 90000,
                currency: 'EUR',
            },
            createdAt: '2024-01-10T00:00:00.000Z',
        },
        amountBreakdowns: {
            fundsCapturedBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'capture',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'fee',
                },
            ],
        },
    },
    {
        balanceAccountId: '1234567890123456',
        payout: {
            fundsCapturedAmount: {
                value: 300,
                currency: 'EUR',
            },
            adjustmentAmount: {
                value: -8500,
                currency: 'EUR',
            },
            payoutAmount: {
                value: 91500,
                currency: 'EUR',
            },
            unpaidAmount: {
                value: 90000,
                currency: 'EUR',
            },
            createdAt: '2024-06-09T00:00:00.000Z',
        },
        amountBreakdowns: {
            fundsCapturedBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'capture',
                },
                {
                    amount: {
                        value: 1000,
                        currency: 'EUR',
                    },
                    category: 'correction',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'fee',
                },
                {
                    amount: {
                        value: 1000,
                        currency: 'EUR',
                    },
                    category: 'correction',
                },
            ],
        },
    },
    {
        balanceAccountId: '1234567890123456',
        payout: {
            fundsCapturedAmount: {
                value: 100000,
                currency: 'EUR',
            },
            adjustmentAmount: {
                value: -10000,
                currency: 'EUR',
            },
            payoutAmount: {
                value: 90000,
                currency: 'EUR',
            },
            unpaidAmount: {
                value: 90000,
                currency: 'EUR',
            },
            createdAt: '2024-05-10T00:00:00.000Z',
        },
        amountBreakdowns: {
            fundsCapturedBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'capture',
                },
                {
                    amount: {
                        value: 1000,
                        currency: 'EUR',
                    },
                    category: 'correction',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'fee',
                },
                {
                    amount: {
                        value: 1000,
                        currency: 'EUR',
                    },
                    category: 'correction',
                },
            ],
        },
    },
    {
        balanceAccountId: '1234567890123456',
        payout: {
            fundsCapturedAmount: {
                value: 800000,
                currency: 'USD',
            },
            adjustmentAmount: {
                value: -100000,
                currency: 'USD',
            },
            payoutAmount: {
                value: 600000,
                currency: 'USD',
            },
            unpaidAmount: {
                value: 100000,
                currency: 'USD',
            },
            createdAt: '2024-05-13T10:00:00Z',
        },
        amountBreakdowns: {
            fundsCapturedBreakdown: [
                {
                    amount: {
                        value: -1,
                        currency: 'JPY',
                    },
                    category: 'capture',
                },
                {
                    amount: {
                        value: -80000,
                        currency: 'USD',
                    },
                    category: 'chargeback',
                },
                {
                    amount: {
                        value: 20000,
                        currency: 'USD',
                    },
                    category: 'refund',
                },
                {
                    amount: {
                        value: 30000,
                        currency: 'USD',
                    },
                    category: 'correction',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -500,
                        currency: 'USD',
                    },
                    category: 'correction',
                },
                {
                    amount: {
                        value: -500,
                        currency: 'USD',
                    },
                    category: 'fee',
                },
                {
                    amount: {
                        value: -300,
                        currency: 'USD',
                    },
                    category: 'grantIssued',
                },
                {
                    amount: {
                        value: -200,
                        currency: 'USD',
                    },
                    category: 'grantRepayment',
                },
                {
                    amount: {
                        value: -500,
                        currency: 'USD',
                    },
                    category: 'other',
                },
                {
                    amount: {
                        value: 100,
                        currency: 'EUR',
                    },
                    category: 'refund',
                },
                {
                    amount: {
                        value: 1000,
                        currency: 'IQD',
                    },
                    category: 'transfer',
                },
            ],
        },
    },
    {
        balanceAccountId: '1234567890123456',
        payout: {
            fundsCapturedAmount: {
                value: 100000,
                currency: 'EUR',
            },
            adjustmentAmount: {
                value: -10000,
                currency: 'EUR',
            },
            payoutAmount: {
                value: 90000,
                currency: 'EUR',
            },
            unpaidAmount: {
                value: 90000,
                currency: 'EUR',
            },
            createdAt: '2024-01-10T00:00:00.000Z',
        },
        amountBreakdowns: {
            fundsCapturedBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'capture',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'fee',
                },
            ],
        },
    },
    {
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        payout: {
            fundsCapturedAmount: {
                value: 100000,
                currency: 'EUR',
            },
            adjustmentAmount: {
                value: -10000,
                currency: 'EUR',
            },
            payoutAmount: {
                value: 90000,
                currency: 'EUR',
            },
            unpaidAmount: {
                value: 90000,
                currency: 'EUR',
            },
            createdAt: '2021-07-10T00:00:00.000Z',
        },
        amountBreakdowns: {
            fundsCapturedBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'capture',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'fee',
                },
            ],
        },
    },
    {
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        payout: {
            fundsCapturedAmount: {
                value: 100000,
                currency: 'EUR',
            },
            adjustmentAmount: {
                value: -10000,
                currency: 'EUR',
            },
            payoutAmount: {
                value: 90000,
                currency: 'EUR',
            },
            unpaidAmount: {
                value: 90000,
                currency: 'EUR',
            },
            createdAt: '2024-04-12T10:00:00.000Z',
        },
        amountBreakdowns: {
            fundsCapturedBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'capture',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'fee',
                },
            ],
        },
    },
    {
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        payout: {
            fundsCapturedAmount: {
                value: 90000,
                currency: 'EUR',
            },
            adjustmentAmount: {
                value: -5000,
                currency: 'EUR',
            },
            payoutAmount: {
                value: 85000,
                currency: 'EUR',
            },
            unpaidAmount: {
                value: 90000,
                currency: 'EUR',
            },
            createdAt: '2024-05-13T10:00:00.000Z',
        },
        amountBreakdowns: {
            fundsCapturedBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'capture',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'fee',
                },
            ],
        },
    },
    {
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        payout: {
            fundsCapturedAmount: {
                value: 50000,
                currency: 'EUR',
            },
            adjustmentAmount: {
                value: -5000,
                currency: 'EUR',
            },
            payoutAmount: {
                value: 45000,
                currency: 'EUR',
            },
            unpaidAmount: {
                value: 90000,
                currency: 'EUR',
            },
            createdAt: '2024-01-18T10:00:00.000Z',
        },
        amountBreakdowns: {
            fundsCapturedBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'capture',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'fee',
                },
            ],
        },
    },
    {
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        payout: {
            fundsCapturedAmount: {
                value: 20000,
                currency: 'EUR',
            },
            adjustmentAmount: {
                value: -1000,
                currency: 'EUR',
            },
            payoutAmount: {
                value: 19000,
                currency: 'EUR',
            },
            unpaidAmount: {
                value: 90000,
                currency: 'EUR',
            },
            createdAt: '2024-12-20T10:00:00.000Z',
        },
        amountBreakdowns: {
            fundsCapturedBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'capture',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'fee',
                },
            ],
        },
    },
    {
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        payout: {
            fundsCapturedAmount: {
                value: 1000000,
                currency: 'EUR',
            },
            adjustmentAmount: {
                value: -200000,
                currency: 'EUR',
            },
            payoutAmount: {
                value: 800000,
                currency: 'EUR',
            },
            unpaidAmount: {
                value: 90000,
                currency: 'EUR',
            },
            createdAt: '2024-11-21T10:00:00.000Z',
        },
        amountBreakdowns: {
            fundsCapturedBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'capture',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'fee',
                },
            ],
        },
    },
    {
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        payout: {
            fundsCapturedAmount: {
                value: 30000,
                currency: 'EUR',
            },
            adjustmentAmount: {
                value: -5000,
                currency: 'EUR',
            },
            payoutAmount: {
                value: 25000,
                currency: 'EUR',
            },
            unpaidAmount: {
                value: 90000,
                currency: 'EUR',
            },
            createdAt: '2023-10-29T10:00:00.000Z',
        },
        amountBreakdowns: {
            fundsCapturedBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'capture',
                },
                {
                    amount: {
                        value: 1500,
                        currency: 'EUR',
                    },
                    category: 'correction',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'fee',
                },
            ],
        },
    },
    {
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        payout: {
            fundsCapturedAmount: {
                value: 30000,
                currency: 'EUR',
            },
            adjustmentAmount: {
                value: -5000,
                currency: 'EUR',
            },
            payoutAmount: {
                value: 25000,
                currency: 'EUR',
            },
            unpaidAmount: {
                value: 90000,
                currency: 'EUR',
            },
            createdAt: '2025-02-02T10:00:00.000Z',
            isSumOfSameDayPayouts: true,
        },
        amountBreakdowns: {
            fundsCapturedBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'capture',
                },
                {
                    amount: {
                        value: 1500,
                        currency: 'EUR',
                    },
                    category: 'correction',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'fee',
                },
            ],
        },
    },
];

// TODO: Remove ts-ignore when OpenAPI contract changes payout field to non-optional
// @ts-ignore
export const getPayouts = balanceAccountId =>
    PAYOUTS_WITH_DETAILS.filter(payout => balanceAccountId === payout.balanceAccountId).map(payout => payout.payout as IPayout);
