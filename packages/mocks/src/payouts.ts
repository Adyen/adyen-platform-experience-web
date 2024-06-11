import type { IPayout, IPayoutDetails } from '@adyen/adyen-platform-experience-web/src';

export const PAYOUTS_WITH_DETAILS: (IPayoutDetails & { balanceAccountId: string })[] = [
    {
        balanceAccountId: 'BA32272223222B5CTDNB66W2Z',
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
                    category: 'Fee',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'Fee',
                },
            ],
        },
    },
    {
        balanceAccountId: 'BA32272223222B5CTDNB66W2Z',
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
                    category: 'Fee',
                },
                {
                    amount: {
                        value: 1000,
                        currency: 'EUR',
                    },
                    category: 'Correction',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'Fee',
                },
                {
                    amount: {
                        value: 1000,
                        currency: 'EUR',
                    },
                    category: 'Correction',
                },
            ],
        },
    },
    {
        balanceAccountId: 'BA32272223222B5CTDNB66W2Z',
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
                    category: 'Fee',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'Fee',
                },
            ],
        },
    },
    {
        balanceAccountId: 'BA32272223222B5CTDNB66W2Z',
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
            createdAt: '2022-07-10T00:00:00.000Z',
        },
        amountBreakdowns: {
            fundsCapturedBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'Fee',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'Fee',
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
                    category: 'Fee',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'Fee',
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
                    category: 'Fee',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'Fee',
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
                    category: 'Fee',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'Fee',
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
                    category: 'Fee',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'Fee',
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
                    category: 'Fee',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'Fee',
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
                    category: 'Fee',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'Fee',
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
            createdAt: '2024-10-29T10:00:00.000Z',
        },
        amountBreakdowns: {
            fundsCapturedBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'Fee',
                },
                {
                    amount: {
                        value: 1500,
                        currency: 'EUR',
                    },
                    category: 'Correction',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'Fee',
                },
            ],
        },
    },
];

// TODO: Remove ts-ignore when OpenAPI contract changes payout field to non-optional
// @ts-ignore
export const PAYOUTS: IPayout[] = PAYOUTS_WITH_DETAILS.map(payout => payout.payout);
