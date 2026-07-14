import { operations } from '@integration-components/types/api/resources/TransactionsResourceV1';
import { ExtractResponseType } from '@integration-components/types/api/endpoints';
import process from 'node:process';
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
        balanceAccountId: 'BA32CNP223227N5KZ2NDW77PR',
        amount: {
            value: 784,
            currency: 'EUR',
        },
        originalAmount: {
            value: 791,
            currency: 'EUR',
        },
        deductedAmount: {
            value: 7,
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
        paymentPspReference: 'NRV62WWPC6BCLGV5',
    },
    refund_details_response: {
        id: 'EVJN42CNJ223224D5PMV3SS3CL75C4EUR',
        balanceAccountId: 'BA32CNP223227N5KZ2NDW77PR',
        amount: {
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
