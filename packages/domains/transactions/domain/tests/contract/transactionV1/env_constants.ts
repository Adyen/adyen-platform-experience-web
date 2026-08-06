import { operations } from '@integration-components/types/api/resources/TransactionsResourceV1';
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
    transactionId: 'EVJN429X222422465P9NXR29FV549NUSD',
    refundTransactionId: 'EVJN429WW22422455P8KJH8C8V6864USD',
    transaction_details_response: {
        id: 'EVJN429X222422465P9NXR29FV549NUSD',
        balanceAccountId: 'BA322VD223222B5DWD3RT4JZQ',
        amount: {
            value: 23,
            currency: 'USD',
        },
        originalAmount: {
            value: 20,
            currency: 'EUR',
        },
        createdAt: '2026-04-28T14:29:58.000+00:00',
        category: 'Payment',
        status: 'Booked',
        paymentMethod: {
            type: 'visa',
            lastFourDigits: '4476',
            description: 'Visa',
        },
        refundDetails: {
            refundMode: 'partially_refundable_any_amount',
            refundStatuses: [],
            refundableAmount: {
                value: 20,
                currency: 'EUR',
            },
            refundLocked: false,
        },
        paymentPspReference: 'LT4QD65NB6TCTDG3',
    },
    refund_details_response: {
        id: 'EVJN429WW22422455P8KJH8C8V6864USD',
        balanceAccountId: 'BA322VD223222B5DWD3RT4JZQ',
        amount: {
            value: -200,
            currency: 'USD',
        },
        createdAt: '2026-04-20T14:47:46.000+00:00',
        category: 'Refund',
        status: 'Booked',
        paymentMethod: {
            type: 'paypal',
            description: 'PayPal',
        },
        paymentPspReference: 'HN35ZZDXP8DP3ZZ3',
        refundMetadata: {
            refundPspReference: 'HZJPJPRQTHKCKSX3',
            refundType: 'full',
        },
    },
};

export const ENVS = {
    test: TEST,
    live: LIVE,
};
