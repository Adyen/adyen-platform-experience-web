import { operations } from '@integration-components/types/api/resources/TransactionsResourceV2';
import { ExtractResponseType } from '@integration-components/types/api/endpoints';
import dotenv from 'dotenv';

dotenv.config({ path: './envs/.env' });

interface TransactionsVariables {
    transactionId: string;
    refundTransactionId: string;
    transaction_details_response: ExtractResponseType<operations['getTransaction']>;
    refund_details_response: ExtractResponseType<operations['getTransaction']>;
}

const TEST: TransactionsVariables = {
    transactionId: 'EVJN4298X223224D5PMV3Q783W4D2SEUR',
    refundTransactionId: 'EVJN42CNJ223224D5PMV3SS3CL75C4EUR',
    transaction_details_response: {
        id: 'EVJN4298X223224D5PMV3Q783W4D2SEUR',
        amountBeforeDeductions: {
            value: 791,
            currency: 'EUR',
        },
        netAmount: {
            value: 784,
            currency: 'EUR',
        },
        createdAt: '2026-07-10T01:00:45.000+00:00',
        category: 'Payment',
        status: 'Booked',
        paymentMethod: {
            type: 'mc',
            lastFourDigits: '0008',
            description: 'Mastercard',
        },
        paymentPspReference: 'NRV62WWPC6BCLGV5',
        balanceAccountId: 'BA32CNP223227N5KZ2NDW77PR',
        merchantReference: 'dtp-2026-07-10T03:00:45.336297474',
        originalAmount: {
            value: 791,
            currency: 'EUR',
        },
        additions: [],
        deductions: [
            {
                currency: 'EUR',
                value: -7,
                type: 'fee',
            },
        ],
        events: [
            {
                type: 'Capture',
                status: 'RefundedAcquirer',
                amount: {
                    value: -791,
                    currency: 'EUR',
                },
                createdAt: '2026-07-10T01:01:52.000+00:00',
            },
            {
                type: 'Capture',
                status: 'SettledAcquirer',
                amount: {
                    value: 791,
                    currency: 'EUR',
                },
                createdAt: '2026-07-10T01:00:45.000+00:00',
            },
        ],
        refundDetails: {
            refundMode: 'non_refundable',
            refundStatuses: [
                {
                    amount: {
                        value: -791,
                        currency: 'EUR',
                    },
                    status: 'completed',
                },
            ],
            refundLocked: false,
        },
    },
    refund_details_response: {
        id: 'EVJN42CNJ223224D5PMV3SS3CL75C4EUR',
        amountBeforeDeductions: {
            value: -791,
            currency: 'EUR',
        },
        netAmount: {
            value: -784,
            currency: 'EUR',
        },
        createdAt: '2026-07-10T01:01:52.000+00:00',
        category: 'Refund',
        status: 'Booked',
        paymentMethod: {
            type: 'mc',
            lastFourDigits: '0008',
            description: 'Mastercard',
        },
        paymentPspReference: 'NRV62WWPC6BCLGV5',
        balanceAccountId: 'BA32CNP223227N5KZ2NDW77PR',
        merchantReference: 'dtp-2026-07-10T03:00:45.336297474',
        originalAmount: {
            value: -791,
            currency: 'EUR',
        },
        additions: [],
        deductions: [
            {
                currency: 'EUR',
                value: 7,
                type: 'fee',
            },
        ],
        events: [
            {
                type: 'Capture',
                status: 'RefundedAcquirer',
                amount: {
                    value: -791,
                    currency: 'EUR',
                },
                createdAt: '2026-07-10T01:01:52.000+00:00',
            },
            {
                type: 'Capture',
                status: 'SettledAcquirer',
                amount: {
                    value: 791,
                    currency: 'EUR',
                },
                createdAt: '2026-07-10T01:00:45.000+00:00',
            },
        ],
        refundMetadata: {
            refundPspReference: 'X2XNCDS3NK7S2LV5',
            originalPaymentId: 'EVJN4298X223224D5PMV3Q783W4D2SEUR',
            refundType: 'full',
        },
    },
};

const LIVE: TransactionsVariables = {
    transactionId: 'EVJN42BZ3224223N5LV36736LL394XEUR',
    refundTransactionId: 'EVJN42DFG224223N5LV388H83Z53M6EUR',
    transaction_details_response: {
        id: 'EVJN42BZ3224223N5LV36736LL394XEUR',
        amountBeforeDeductions: {
            value: 2,
            currency: 'EUR',
        },
        netAmount: {
            value: 2,
            currency: 'EUR',
        },
        createdAt: '2025-01-02T10:29:33.000+00:00',
        category: 'Payment',
        status: 'Booked',
        paymentMethod: {
            type: 'balanceplatform',
            description: 'BalancePlatform transactions',
        },
        paymentPspReference: 'HQWBBRVF7PWL3FF3',
        balanceAccountId: 'BA322VJ223226S5KGB6H492CL',
        merchantReference: 'harryk-payment-2025-01-02T10:27:34.050Z',
        originalAmount: {
            value: 2,
            currency: 'EUR',
        },
        additions: [],
        deductions: [],
        events: [
            {
                type: 'Capture',
                status: 'Refunded',
                amount: {
                    value: -1,
                    currency: 'EUR',
                },
                createdAt: '2025-01-02T10:43:32.000+00:00',
            },
            {
                type: 'Capture',
                status: 'Refunded',
                amount: {
                    value: -1,
                    currency: 'EUR',
                },
                createdAt: '2025-01-02T10:42:42.000+00:00',
            },
            {
                type: 'Capture',
                status: 'Settled',
                amount: {
                    value: 2,
                    currency: 'EUR',
                },
                createdAt: '2025-01-02T10:27:38.000+00:00',
            },
        ],
        refundDetails: {
            refundMode: 'non_refundable',
            refundStatuses: [
                {
                    amount: {
                        value: -1,
                        currency: 'EUR',
                    },
                    status: 'completed',
                },
                {
                    amount: {
                        value: -1,
                        currency: 'EUR',
                    },
                    status: 'completed',
                },
            ],
            refundLocked: false,
        },
    },
    refund_details_response: {
        id: 'EVJN42DFG224223N5LV388H83Z53M6EUR',
        amountBeforeDeductions: {
            value: -1,
            currency: 'EUR',
        },
        netAmount: {
            value: -1,
            currency: 'EUR',
        },
        createdAt: '2025-01-02T10:56:21.000+00:00',
        category: 'Refund',
        status: 'Booked',
        paymentMethod: {
            type: 'balanceplatform',
            description: 'BalancePlatform transactions',
        },
        paymentPspReference: 'TF72TCH83JD65BZ3',
        balanceAccountId: 'BA322VJ223226S5KGB6H492CL',
        merchantReference: 'harryk-payment-2025-01-02T10:51:53.672Z',
        originalAmount: {
            value: -1,
            currency: 'EUR',
        },
        additions: [],
        deductions: [],
        events: [
            {
                type: 'Capture',
                status: 'Refunded',
                amount: {
                    value: -1,
                    currency: 'EUR',
                },
                createdAt: '2025-01-02T10:55:22.000+00:00',
            },
            {
                type: 'Capture',
                status: 'Settled',
                amount: {
                    value: 1,
                    currency: 'EUR',
                },
                createdAt: '2025-01-02T10:52:09.000+00:00',
            },
        ],
        refundMetadata: {
            refundPspReference: 'KBKBBJF59LW2QZX3',
            refundReason: 'requested_by_customer',
            originalPaymentId: 'EVJN42D85224223N5LV382F9DX6C2LEUR',
            refundType: 'full',
        },
    },
};

export const ENVS = {
    test: TEST,
    live: LIVE,
};
