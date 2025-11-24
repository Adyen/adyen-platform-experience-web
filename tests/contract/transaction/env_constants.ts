import process from 'node:process';
import dotenv from 'dotenv';
import { SuccessResponse } from '../../../src/types/api/endpoints';

dotenv.config({ path: './envs/.env' });

interface TransactionsVariables {
    transactionId: string;
    refundTransactionId: string;
    transaction_details_response: SuccessResponse<'getTransaction'>;
    refund_details_response: SuccessResponse<'getTransaction'>;
}

const TEST: TransactionsVariables = {
    transactionId: 'EVJN42CM7223223N5LQZCWQDZZ29MFEUR',
    refundTransactionId: 'EVJN42CKX223223N5LV3B7V5VK2LT8EUR',
    transaction_details_response: {
        id: 'EVJN42CM7223223N5LQZCWQDZZ29MFEUR',
        balanceAccountId: process.env.BALANCE_ACCOUNT || '',
        amount: {
            value: 900,
            currency: 'EUR',
        },
        originalAmount: {
            value: 1000,
            currency: 'EUR',
        },
        deductedAmount: {
            value: 100,
            currency: 'EUR',
        },
        createdAt: '2024-12-11T15:20:00.000+00:00',
        category: 'Payment',
        status: 'Booked',
        paymentMethod: {
            description: 'Visa',
            type: 'visa',
            lastFourDigits: '1111',
        },
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
        paymentPspReference: 'L9TRSQPRP472P4V5',
    },
    refund_details_response: {
        id: 'EVJN42CKX223223N5LV3B7V5VK2LT8EUR',
        balanceAccountId: process.env.BALANCE_ACCOUNT || '',
        amount: {
            value: -900,
            currency: 'EUR',
        },
        createdAt: '2025-01-02T11:22:12.000+00:00',
        category: 'Refund',
        status: 'Booked',
        paymentMethod: {
            description: 'Visa',
            type: 'visa',
            lastFourDigits: '1111',
        },
        paymentPspReference: 'L9TRSQPRP472P4V5',
        refundMetadata: {
            refundPspReference: 'BXBZVHZH5S5H3275',
            originalPaymentId: 'EVJN42CM7223223N5LQZCWQDZZ29MFEUR',
            refundReason: 'requested_by_customer',
            refundType: 'full',
        },
    },
};

const LIVE: TransactionsVariables = {
    transactionId: 'EVJN42BZ3224223N5LV36736LL394XEUR',
    refundTransactionId: 'EVJN42DFG224223N5LV388H83Z53M6EUR',
    transaction_details_response: {
        id: 'EVJN42BZ3224223N5LV36736LL394XEUR',
        balanceAccountId: process.env.BALANCE_ACCOUNT || '',
        amount: {
            value: 2,
            currency: 'EUR',
        },
        originalAmount: {
            value: 2,
            currency: 'EUR',
        },
        deductedAmount: {
            value: 0,
            currency: 'EUR',
        },
        paymentMethod: {
            type: 'balanceplatform',
            description: 'BalancePlatform transactions',
        },
        createdAt: '2025-01-02T10:29:33.000+00:00',
        category: 'Payment',
        status: 'Booked',
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
        paymentPspReference: 'HQWBBRVF7PWL3FF3',
    },
    refund_details_response: {
        id: 'EVJN42DFG224223N5LV388H83Z53M6EUR',
        balanceAccountId: process.env.BALANCE_ACCOUNT || '',
        amount: {
            value: -1,
            currency: 'EUR',
        },
        paymentMethod: {
            type: 'balanceplatform',
            description: 'BalancePlatform transactions',
        },
        createdAt: '2025-01-02T10:56:21.000+00:00',
        category: 'Refund',
        status: 'Booked',
        paymentPspReference: 'TF72TCH83JD65BZ3',
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
