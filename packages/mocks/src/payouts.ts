import type { IPayout, IPayoutDetails } from '@adyen/adyen-platform-experience-web/src';

export const PAYOUTS_WITH_DETAILS: IPayoutDetails[] = [
    {
        payout: {
            id: '1234567890123456',
            balanceAccountId: 'BA32272223222B5CTDNB66W2Z',
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
            createdAt: new Date().toDateString(),
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
        payout: {
            id: '1234567890123451',
            balanceAccountId: 'BA32272223222B5CTDNB66W2Z',
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
            createdAt: new Date().toDateString(),
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
        payout: {
            id: '1234567890123452',
            balanceAccountId: 'BA32272223222B5CTDNB66W2Z',
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
            createdAt: new Date().toDateString(),
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
        payout: {
            id: '1234567890123453',
            balanceAccountId: 'BA32272223222B5CTDNB66W2Z',
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
            createdAt: new Date().toDateString(),
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
        payout: {
            id: '1234567890123454',
            balanceAccountId: 'BA32272223222B5CTDNB66W2Z',
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
            createdAt: new Date().toDateString(),
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
        payout: {
            id: '1WEPGD5VS767881Q',
            balanceAccountId: 'BA32272223222B5CTDNB66W2Z',
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
        payout: {
            id: '1WEPGD5VS767881E',
            balanceAccountId: 'BA32272223222B5CTDNB66W2Z',
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
            createdAt: '2024-04-13T10:00:00.000Z',
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
        payout: {
            id: '1WEPGD5VS767882E',
            balanceAccountId: 'BA32272223222B5CTDNB66W2Z',
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
            createdAt: '2024-04-18T10:00:00.000Z',
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
        payout: {
            id: '1WEPGD5VS767883E',
            balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
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
            createdAt: '2024-04-20T10:00:00.000Z',
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
        payout: {
            id: '1WEPGD5VS767885E',
            balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
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
            createdAt: '2024-04-21T10:00:00.000Z',
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
        payout: {
            id: '1WEPGD5VS767886E',
            balanceAccountId: 'BA32272223222B5CTDQPM6W2K',
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
            createdAt: '2024-04-29T10:00:00.000Z',
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
];

// TODO: Remove ts-ignore when OpenAPI contract changes payout field to non-optional
// @ts-ignore
export const PAYOUTS: IPayout[] = PAYOUTS_WITH_DETAILS.map(payout => payout.payout);
