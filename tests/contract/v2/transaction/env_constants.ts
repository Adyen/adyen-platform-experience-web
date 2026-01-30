import { operations } from '../../../../src/types/api/resources/TransactionsResourceV2';
import { ExtractResponseType } from '../../../../src/types/api/endpoints';
import dotenv from 'dotenv';

dotenv.config({ path: './envs/.env' });

interface TransactionsVariables {
    transactionId: string;
    refundTransactionId: string;
    transaction_details_response: ExtractResponseType<operations['getTransaction']>;
    refund_details_response: ExtractResponseType<operations['getTransaction']>;
}

const TEST: TransactionsVariables = {
    transactionId: 'EVJN42CM7223223N5LQZCWQDZZ29MFEUR',
    refundTransactionId: 'EVJN42CKX223223N5LV3B7V5VK2LT8EUR',
    transaction_details_response: {
        id: 'EVJN42CM7223223N5LQZCWQDZZ29MFEUR',
        amountBeforeDeductions: {
            value: 1000,
            currency: 'EUR',
        },
        netAmount: {
            value: 892,
            currency: 'EUR',
        },
        createdAt: '2024-12-11T15:20:00.000+00:00',
        category: 'Payment',
        status: 'Booked',
        paymentMethod: {
            type: 'visa',
            lastFourDigits: '1111',
            description: 'Visa',
        },
        paymentPspReference: 'L9TRSQPRP472P4V5',
        balanceAccountId: 'BA32CKZ223227T5L6834T3LBX',
        merchantReference: 'harryk-payment-2024-12-11T15:18:44.177Z',
        originalAmount: {
            value: 1000,
            currency: 'EUR',
        },
        additions: [],
        deductions: [
            {
                currency: 'EUR',
                value: -108,
                type: 'fee',
            },
        ],
        events: [
            {
                type: 'Capture',
                status: 'RefundedAcquirer',
                amount: {
                    value: -1000,
                    currency: 'EUR',
                },
                createdAt: '2025-01-02T11:21:35.000+00:00',
            },
            {
                type: 'Capture',
                status: 'SettledAcquirer',
                amount: {
                    value: 1000,
                    currency: 'EUR',
                },
                createdAt: '2024-12-11T15:19:32.000+00:00',
            },
        ],
        refundDetails: {
            refundMode: 'non_refundable',
            refundStatuses: [
                {
                    amount: {
                        value: -1000,
                        currency: 'EUR',
                    },
                    status: 'completed',
                },
            ],
            refundLocked: false,
        },
    },
    refund_details_response: {
        id: 'EVJN42CKX223223N5LV3B7V5VK2LT8EUR',
        amountBeforeDeductions: {
            value: -900,
            currency: 'EUR',
        },
        netAmount: {
            value: -900,
            currency: 'EUR',
        },
        createdAt: '2025-01-02T11:22:12.000+00:00',
        category: 'Refund',
        status: 'Booked',
        paymentMethod: {
            type: 'visa',
            lastFourDigits: '1111',
            description: 'Visa',
        },
        paymentPspReference: 'L9TRSQPRP472P4V5',
        balanceAccountId: 'BA32CKZ223227T5L6834T3LBX',
        merchantReference: 'harryk-payment-2024-12-11T15:18:44.177Z',
        originalAmount: {
            value: -1000,
            currency: 'EUR',
        },
        additions: [
            {
                currency: 'EUR',
                value: 100,
                type: 'fee',
            },
        ],
        deductions: [],
        events: [
            {
                type: 'Capture',
                status: 'RefundedAcquirer',
                amount: {
                    value: -1000,
                    currency: 'EUR',
                },
                createdAt: '2025-01-02T11:21:35.000+00:00',
            },
            {
                type: 'Capture',
                status: 'SettledAcquirer',
                amount: {
                    value: 1000,
                    currency: 'EUR',
                },
                createdAt: '2024-12-11T15:19:32.000+00:00',
            },
        ],
        refundMetadata: {
            refundPspReference: 'BXBZVHZH5S5H3275',
            refundReason: 'requested_by_customer',
            originalPaymentId: 'EVJN42CM7223223N5LQZCWQDZZ29MFEUR',
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
