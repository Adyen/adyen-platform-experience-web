import { getRequestURL } from '@integration-components/testing/playwright/contract-utils';
import { expectStructure, LIVE_SMOKE_TAG } from '@integration-components/testing/playwright/contract-structure';
import { sessionAwareTest } from '@integration-components/testing/playwright/session-request-function';
import { ExtractResponseType } from '@integration-components/types/api/endpoints';
import { operations } from '@integration-components/types/api/resources/TransactionsResourceV2';
import { APIRequestContext, expect } from '@playwright/test';
import { ENVS } from './env_constants';
import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config({ path: './envs/.env' });

const environment = process.env.NODE_ENV as 'live' | 'test';
const ENV = ENVS[environment] || ENVS.test;

type TransactionDetails = ExtractResponseType<operations['getTransaction']>;

// Structure templates: only the fields and their types matter, the values are placeholders.
const AMOUNT = { value: 0, currency: '' };
const TRANSACTION = {
    id: '',
    balanceAccountId: '',
    amountBeforeDeductions: AMOUNT,
    netAmount: AMOUNT,
    originalAmount: AMOUNT,
    createdAt: '',
    category: 'Payment',
    status: 'Booked',
    paymentMethod: { type: '', lastFourDigits: '', description: '' },
    paymentPspReference: '',
    merchantReference: '',
    additions: [{ currency: '', value: 0, type: '' }],
    deductions: [{ currency: '', value: 0, type: '' }],
    events: [{ type: '', status: '', amount: AMOUNT, createdAt: '' }],
} satisfies TransactionDetails;
const REFUNDED_PAYMENT: TransactionDetails = {
    ...TRANSACTION,
    refundDetails: { refundMode: 'non_refundable', refundStatuses: [{ amount: AMOUNT, status: 'completed' }], refundLocked: false },
};
const REFUND: TransactionDetails = {
    ...TRANSACTION,
    category: 'Refund',
    refundMetadata: { refundPspReference: '', originalPaymentId: '', refundType: 'full' },
};

const expectTransactionStructure = async (
    transactionId: string,
    template: TransactionDetails,
    requestContext: APIRequestContext,
    headers?: { [p: string]: string }
) => {
    const getTransaction = await requestContext.get(
        getRequestURL({
            version: 2,
            method: 'get',
            endpoint: '/transactions/{transactionId}',
            params: {
                path: { transactionId },
            },
        }),
        { headers }
    );

    expect(getTransaction.status()).toBe(200);
    expectStructure(await getTransaction.json(), template);
};

sessionAwareTest(
    '/transactions/{transactionId} endpoint for refunded payment should return the expected structure',
    { tag: LIVE_SMOKE_TAG },
    async ({ requestContext, headers }) => {
        await expectTransactionStructure(ENV.transactionId, REFUNDED_PAYMENT, requestContext, headers);
    }
);

sessionAwareTest(
    '/transactions/{transactionId} endpoint for refund should return the expected structure',
    { tag: LIVE_SMOKE_TAG },
    async ({ requestContext, headers }) => {
        await expectTransactionStructure(ENV.refundTransactionId, REFUND, requestContext, headers);
    }
);
