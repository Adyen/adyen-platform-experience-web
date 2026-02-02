import { getRequestURL } from '../../utils/utils';
import { sessionAwareTest } from '../../utils/session-request-function';
import { ExtractResponseType } from '../../../../src/types/api/endpoints';
import { operations } from '../../../../src/types/api/resources/TransactionsResource';
import { APIRequestContext, expect } from '@playwright/test';
import { ENVS } from './env_constants';
import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config({ path: './envs/.env' });

const environment = process.env.NODE_ENV as 'live' | 'test';
const ENV = ENVS[environment] || ENVS.test;

const confirmTransactionDetails = async (
    transactionId: string,
    transactionResponse: ExtractResponseType<operations['getTransaction']>,
    requestContext: APIRequestContext,
    headers?: { [p: string]: string }
) => {
    const getTransaction = await requestContext.get(
        getRequestURL({
            version: 1,
            method: 'get',
            endpoint: '/transactions/{transactionId}',
            params: {
                path: { transactionId },
            },
        }),
        { headers }
    );

    const responseData = await getTransaction.json();

    expect(getTransaction.status()).toBe(200);
    expect(responseData).toStrictEqual(transactionResponse);
};

sessionAwareTest('/transactions/{transactionId} endpoint for refunded payment should return consistent data', async ({ requestContext, headers }) => {
    await confirmTransactionDetails(ENV.transactionId, ENV.transaction_details_response, requestContext, headers);
});

sessionAwareTest('/transactions/{transactionId} endpoint for refund should return consistent data', async ({ requestContext, headers }) => {
    await confirmTransactionDetails(ENV.refundTransactionId, ENV.refund_details_response, requestContext, headers);
});
