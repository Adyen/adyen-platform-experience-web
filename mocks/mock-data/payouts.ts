import type { IPayoutDetails } from '../../src';
import { BALANCE_ACCOUNTS } from './balanceAccounts';
import getDate from './utils/getDate';

const getCreatedAt = (daysOffset: number) => {
    const date = new Date(getDate(daysOffset));
    date.setHours(0, 0, 0, 0); // start of day
    return date.toISOString();
};

export const PAYOUTS_WITH_DETAILS: (IPayoutDetails & { balanceAccountId: string })[] = [
    {
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
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
            createdAt: getCreatedAt(0),
            isSumOfSameDayPayouts: true,
        },
        amountBreakdowns: {
            fundsCapturedBreakdown: [
                {
                    amount: {
                        value: 120000,
                        currency: 'EUR',
                    },
                    category: 'capture',
                },
                {
                    amount: {
                        value: -30000,
                        currency: 'EUR',
                    },
                    category: 'chargeback',
                },
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'correction',
                },
                {
                    amount: {
                        value: 11000,
                        currency: 'EUR',
                    },
                    category: 'refund',
                },
            ],
            adjustmentBreakdown: [
                {
                    amount: {
                        value: 1000,
                        currency: 'EUR',
                    },
                    category: 'correction',
                },
                {
                    amount: {
                        value: -10000,
                        currency: 'EUR',
                    },
                    category: 'fee',
                },
                {
                    amount: {
                        value: -55000,
                        currency: 'EUR',
                    },
                    category: 'grantIssued',
                },
                {
                    amount: {
                        value: 60000,
                        currency: 'EUR',
                    },
                    category: 'grantRepayment',
                },
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    category: 'other',
                },
                {
                    amount: {
                        value: 10000,
                        currency: 'EUR',
                    },
                    category: 'refund',
                },
                {
                    amount: {
                        value: -15000,
                        currency: 'EUR',
                    },
                    category: 'transfer',
                },
            ],
        },
    },
    {
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        payout: {
            fundsCapturedAmount: {
                value: 100000,
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
                value: 91500,
                currency: 'EUR',
            },
            createdAt: getCreatedAt(-1),
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
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
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
            createdAt: getCreatedAt(-1),
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
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        payout: {
            fundsCapturedAmount: {
                value: 700000,
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
                value: 600000,
                currency: 'USD',
            },
            createdAt: getCreatedAt(-3),
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
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
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
            createdAt: getCreatedAt(-4),
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
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
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
            createdAt: getCreatedAt(-5),
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
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
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
            createdAt: getCreatedAt(-6),
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
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
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
            createdAt: getCreatedAt(-10),
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
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
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
            createdAt: getCreatedAt(-10),
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
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
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
            createdAt: getCreatedAt(-25),
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
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
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
            createdAt: getCreatedAt(-27),
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
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
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
            createdAt: getCreatedAt(-28),
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
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
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
            createdAt: getCreatedAt(-29),
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
