import type { IPayout, IPayoutDetails } from '@adyen/adyen-platform-experience-web/src';

export const PAYOUTS_WITH_DETAILS: IPayoutDetails[] = [
    {
        payout: {
            id: '1234567890123456',
            balanceAccountId: 'BA32272223222B5CTDNB66W2Z',
            grossAmount: {
                value: 100000,
                currency: 'EUR',
            },
            chargesAmount: {
                value: -10000,
                currency: 'EUR',
            },
            netAmount: {
                value: 90000,
                currency: 'EUR',
            },
            createdAt: new Date().toDateString(),
        },
        amountBreakdown: [
            {
                amount: {
                    value: -1000,
                    currency: 'EUR',
                },
                category: 'Fee',
            },
            {
                amount: {
                    value: -8000,
                    currency: 'EUR',
                },
                category: 'Refund',
            },
            {
                amount: {
                    value: -500,
                    currency: 'EUR',
                },
                category: 'Chargeback',
            },
            {
                amount: {
                    value: -500,
                    currency: 'EUR',
                },
                category: 'ReserveRelease',
            },
        ],
    },
    {
        payout: {
            id: '1234567890123451',
            balanceAccountId: 'BA32272223222B5CTDNB66W2Z',
            grossAmount: {
                value: 500,
                currency: 'EUR',
            },
            chargesAmount: {
                value: -8500,
                currency: 'EUR',
            },
            netAmount: {
                value: 91500,
                currency: 'EUR',
            },
            createdAt: new Date().toDateString(),
        },
        amountBreakdown: [
            {
                amount: {
                    value: 1000,
                    currency: 'EUR',
                },
                category: 'Fee',
            },
            {
                amount: {
                    value: 1000,
                    currency: 'EUR',
                },
                category: 'GrantIssued',
            },
            {
                amount: {
                    value: 500,
                    currency: 'EUR',
                },
                category: 'InternalTransfers',
            },
            {
                amount: {
                    value: -8000,
                    currency: 'EUR',
                },
                category: 'Refund',
            },
            {
                amount: {
                    value: -500,
                    currency: 'EUR',
                },
                category: 'Chargeback',
            },
            {
                amount: {
                    value: -500,
                    currency: 'EUR',
                },
                category: 'ReserveRelease',
            },
        ],
    },
    {
        payout: {
            id: '1234567890123452',
            balanceAccountId: 'BA32272223222B5CTDNB66W2Z',
            grossAmount: {
                value: 100000,
                currency: 'EUR',
            },
            chargesAmount: {
                value: -10000,
                currency: 'EUR',
            },
            netAmount: {
                value: 90000,
                currency: 'EUR',
            },
            createdAt: new Date().toDateString(),
        },
        amountBreakdown: [
            {
                amount: {
                    value: -1000,
                    currency: 'EUR',
                },
                category: 'Fee',
            },
            {
                amount: {
                    value: -8000,
                    currency: 'EUR',
                },
                category: 'Refund',
            },
            {
                amount: {
                    value: -500,
                    currency: 'EUR',
                },
                category: 'Chargeback',
            },
            {
                amount: {
                    value: -500,
                    currency: 'EUR',
                },
                category: 'ReserveRelease',
            },
        ],
    },
    {
        payout: {
            id: '1234567890123453',
            balanceAccountId: 'BA32272223222B5CTDNB66W2Z',
            grossAmount: {
                value: 100000,
                currency: 'EUR',
            },
            chargesAmount: {
                value: -10000,
                currency: 'EUR',
            },
            netAmount: {
                value: 90000,
                currency: 'EUR',
            },
            createdAt: new Date().toDateString(),
        },
        amountBreakdown: [
            {
                amount: {
                    value: -1000,
                    currency: 'EUR',
                },
                category: 'Fee',
            },
            {
                amount: {
                    value: -8000,
                    currency: 'EUR',
                },
                category: 'Refund',
            },
            {
                amount: {
                    value: -500,
                    currency: 'EUR',
                },
                category: 'Chargeback',
            },
            {
                amount: {
                    value: -500,
                    currency: 'EUR',
                },
                category: 'ReserveRelease',
            },
        ],
    },
    {
        payout: {
            id: '1234567890123454',
            balanceAccountId: 'BA32272223222B5CTDNB66W2Z',
            grossAmount: {
                value: 100000,
                currency: 'EUR',
            },
            chargesAmount: {
                value: -10000,
                currency: 'EUR',
            },
            netAmount: {
                value: 90000,
                currency: 'EUR',
            },
            createdAt: new Date().toDateString(),
        },
        amountBreakdown: [
            {
                amount: {
                    value: -1000,
                    currency: 'EUR',
                },
                category: 'Fee',
            },
            {
                amount: {
                    value: -8000,
                    currency: 'EUR',
                },
                category: 'Refund',
            },
            {
                amount: {
                    value: -500,
                    currency: 'EUR',
                },
                category: 'Chargeback',
            },
            {
                amount: {
                    value: -500,
                    currency: 'EUR',
                },
                category: 'ReserveRelease',
            },
        ],
    },
    {
        payout: {
            id: '1WEPGD5VS767881Q',
            balanceAccountId: 'BA32272223222B5CTDNB66W2Z',
            grossAmount: {
                value: 100000,
                currency: 'EUR',
            },
            chargesAmount: {
                value: -10000,
                currency: 'EUR',
            },
            netAmount: {
                value: 90000,
                currency: 'EUR',
            },
            createdAt: '2024-04-12T10:00:00.000Z',
        },
        amountBreakdown: [
            {
                amount: {
                    value: -1000,
                    currency: 'EUR',
                },
                category: 'Fee',
            },
            {
                amount: {
                    value: -8000,
                    currency: 'EUR',
                },
                category: 'Refund',
            },
            {
                amount: {
                    value: -500,
                    currency: 'EUR',
                },
                category: 'Chargeback',
            },
            {
                amount: {
                    value: -500,
                    currency: 'EUR',
                },
                category: 'ReserveRelease',
            },
        ],
    },
    {
        payout: {
            id: '1WEPGD5VS767881E',
            balanceAccountId: 'BA32272223222B5CTDNB66W2Z',
            grossAmount: {
                value: 90000,
                currency: 'EUR',
            },
            chargesAmount: {
                value: -5000,
                currency: 'EUR',
            },
            netAmount: {
                value: 85000,
                currency: 'EUR',
            },
            createdAt: '2024-04-13T10:00:00.000Z',
        },
        amountBreakdown: [
            {
                amount: {
                    value: -1000,
                    currency: 'EUR',
                },
                category: 'fee',
            },
            {
                amount: {
                    value: -1500,
                    currency: 'EUR',
                },
                category: 'Chargeback',
            },
            {
                amount: {
                    value: -2500,
                    currency: 'EUR',
                },
                category: 'ReserveRelease',
            },
        ],
    },
    {
        payout: {
            id: '1WEPGD5VS767882E',
            balanceAccountId: 'BA32272223222B5CTDNB66W2Z',
            grossAmount: {
                value: 50000,
                currency: 'EUR',
            },
            chargesAmount: {
                value: -5000,
                currency: 'EUR',
            },
            netAmount: {
                value: 45000,
                currency: 'EUR',
            },
            createdAt: '2024-04-18T10:00:00.000Z',
        },
        amountBreakdown: [
            {
                amount: {
                    value: -1000,
                    currency: 'EUR',
                },
                category: 'Fee',
            },
            {
                amount: {
                    value: -2000,
                    currency: 'EUR',
                },
                category: 'Refund',
            },
            {
                amount: {
                    value: -1000,
                    currency: 'EUR',
                },
                category: 'Chargeback',
            },
            {
                amount: {
                    value: -1000,
                    currency: 'EUR',
                },
                category: 'ReserveRelease',
            },
        ],
    },
    {
        payout: {
            id: '1WEPGD5VS767883E',
            balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
            grossAmount: {
                value: 20000,
                currency: 'EUR',
            },
            chargesAmount: {
                value: -1000,
                currency: 'EUR',
            },
            netAmount: {
                value: 19000,
                currency: 'EUR',
            },
            createdAt: '2024-04-20T10:00:00.000Z',
        },
        amountBreakdown: [
            {
                amount: {
                    value: -1000,
                    currency: 'EUR',
                },
                category: 'Fee',
            },
        ],
    },
    {
        payout: {
            id: '1WEPGD5VS767885E',
            balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
            grossAmount: {
                value: 1000000,
                currency: 'EUR',
            },
            chargesAmount: {
                value: -200000,
                currency: 'EUR',
            },
            netAmount: {
                value: 800000,
                currency: 'EUR',
            },
            createdAt: '2024-04-21T10:00:00.000Z',
        },
        amountBreakdown: [
            {
                amount: {
                    value: -100000,
                    currency: 'EUR',
                },
                category: 'Fee',
            },
            {
                amount: {
                    value: -100000,
                    currency: 'EUR',
                },
                category: 'Refund',
            },
        ],
    },
    {
        payout: {
            id: '1WEPGD5VS767886E',
            balanceAccountId: 'BA32272223222B5CTDQPM6W2K',
            grossAmount: {
                value: 30000,
                currency: 'EUR',
            },
            chargesAmount: {
                value: -5000,
                currency: 'EUR',
            },
            netAmount: {
                value: 25000,
                currency: 'EUR',
            },
            createdAt: '2024-04-29T10:00:00.000Z',
        },
        amountBreakdown: [
            {
                amount: {
                    value: -1000,
                    currency: 'EUR',
                },
                category: 'Fee',
            },
            {
                amount: {
                    value: -7000,
                    currency: 'EUR',
                },
                category: 'Chargeback',
            },
            {
                amount: {
                    value: 3000,
                    currency: 'EUR',
                },
                category: 'Other',
            },
        ],
    },
];

// TODO: Remove ts-ignore when OpenAPI contract changes payout field to non-optional
// @ts-ignore
export const PAYOUTS: IPayout[] = PAYOUTS_WITH_DETAILS.map(payout => payout.payout);
