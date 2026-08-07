import { operations } from '@integration-components/types/api/resources/TransactionsResourceV2';
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
        balanceAccountId: process.env.BALANCE_ACCOUNT || '',
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
        balanceAccountId: process.env.BALANCE_ACCOUNT || '',
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
    transactionId: 'EVJN42CBL224224G5PRTJ299S65SCMEUR',
    refundTransactionId: 'EVJN429QC224224G5PRTRVW6SR5WVHEUR',
    transaction_details_response: {
        id: 'EVJN42CBL224224G5PRTJ299S65SCMEUR',
        amountBeforeDeductions: {
            value: 3,
            currency: 'EUR',
        },
        netAmount: {
            value: -7,
            currency: 'EUR',
        },
        createdAt: '2026-08-07T08:32:35.000+00:00',
        category: 'Payment',
        status: 'Booked',
        paymentMethod: {
            type: 'mc',
            lastFourDigits: '6031',
            description: 'Mastercard',
        },
        paymentPspReference: 'FN9D87KLN2SVCFX3',
        balanceAccountId: process.env.BALANCE_ACCOUNT || '',
        merchantReference: 'maksymr payment test',
        originalAmount: {
            value: 3,
            currency: 'EUR',
        },
        additions: [],
        deductions: [
            {
                currency: 'EUR',
                value: -10,
                type: 'fee',
            },
        ],
        events: [
            {
                type: 'Capture',
                status: 'RefundedBulk',
                amount: {
                    value: -3,
                    currency: 'EUR',
                },
                createdAt: '2026-08-07T10:15:34.000+00:00',
            },
            {
                type: 'Capture',
                status: 'SettledBulk',
                amount: {
                    value: 3,
                    currency: 'EUR',
                },
                createdAt: '2026-08-07T08:32:35.000+00:00',
            },
        ],
        refundDetails: {
            refundMode: 'non_refundable',
            refundStatuses: [
                {
                    amount: {
                        value: -3,
                        currency: 'EUR',
                    },
                    status: 'completed',
                },
            ],
            refundLocked: false,
        },
    },
    refund_details_response: {
        id: 'EVJN429QC224224G5PRTRVW6SR5WVHEUR',
        amountBeforeDeductions: {
            value: -3,
            currency: 'EUR',
        },
        netAmount: {
            value: -2,
            currency: 'EUR',
        },
        createdAt: '2026-08-07T10:15:34.000+00:00',
        category: 'Refund',
        status: 'Booked',
        paymentMethod: {
            type: 'mc',
            lastFourDigits: '6031',
            description: 'Mastercard',
        },
        paymentPspReference: 'FN9D87KLN2SVCFX3',
        balanceAccountId: process.env.BALANCE_ACCOUNT || '',
        merchantReference: 'maksymr payment test',
        originalAmount: {
            value: -3,
            currency: 'EUR',
        },
        additions: [],
        deductions: [
            {
                currency: 'EUR',
                value: 1,
                type: 'fee',
            },
        ],
        events: [
            {
                type: 'Capture',
                status: 'RefundedBulk',
                amount: {
                    value: -3,
                    currency: 'EUR',
                },
                createdAt: '2026-08-07T10:15:34.000+00:00',
            },
            {
                type: 'Capture',
                status: 'SettledBulk',
                amount: {
                    value: 3,
                    currency: 'EUR',
                },
                createdAt: '2026-08-07T08:32:35.000+00:00',
            },
        ],
        refundMetadata: {
            refundPspReference: 'S3SJZJ22HWNFN7H3',
            refundReason: 'requested_by_customer',
            originalPaymentId: 'EVJN42CBL224224G5PRTJ299S65SCMEUR',
            refundType: 'full',
        },
    },
};

export const ENVS = {
    test: TEST,
    live: LIVE,
};
