import { sessionAwareTest } from '@integration-components/testing/playwright/session-request-function';
import { getRequestURL } from '@integration-components/testing/playwright/contract-utils';
import { expectNonEmpty, expectStructure, recentDateRange } from '@integration-components/testing/playwright/contract-structure';
import { SuccessResponse } from '@integration-components/types/api/endpoints';
import { APIRequestContext, expect } from '@playwright/test';
import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config({ path: './envs/.env' });

const balanceAccountId = process.env.BALANCE_ACCOUNT || '';

// Structure templates: only the fields and their types matter, the values are placeholders.
const AMOUNT = { value: 0, currency: '' };
const PAYOUT: SuccessResponse<'getPayouts'>['data'][number] = {
    fundsCapturedAmount: AMOUNT,
    adjustmentAmount: AMOUNT,
    payoutAmount: AMOUNT,
    unpaidAmount: AMOUNT,
    createdAt: '',
};
const PAYOUT_BREAKDOWN: SuccessResponse<'getPayout'> = {
    payout: PAYOUT,
    amountBreakdowns: {
        fundsCapturedBreakdown: [{ amount: AMOUNT, category: '' }],
        adjustmentBreakdown: [{ amount: AMOUNT, category: '' }],
    },
};

const getRecentPayouts = async (requestContext: APIRequestContext, headers?: Record<string, string>) => {
    const response = await requestContext.get(
        getRequestURL({
            version: 1,
            method: 'get',
            endpoint: '/payouts',
            params: { query: { balanceAccountId, ...recentDateRange(180) } },
        }),
        { headers }
    );

    expect(response.status()).toBe(200);
    return response.json() as Promise<SuccessResponse<'getPayouts'>>;
};

sessionAwareTest('/payouts endpoint should return payouts with the expected structure', async ({ requestContext, headers }) => {
    const payouts = await getRecentPayouts(requestContext, headers);

    expectStructure(payouts, { data: [PAYOUT] });
    expectNonEmpty(payouts.data, 'payouts in the last 180 days');
});

sessionAwareTest('/payouts/breakdown endpoint should return a breakdown with the expected structure', async ({ requestContext, headers }) => {
    const [payout] = expectNonEmpty((await getRecentPayouts(requestContext, headers)).data, 'payouts in the last 180 days');

    const breakdown = await requestContext.get(
        getRequestURL({
            version: 1,
            method: 'get',
            endpoint: '/payouts/breakdown',
            params: { query: { balanceAccountId, createdAt: new Date(payout!.createdAt).toISOString() } },
        }),
        { headers }
    );

    expect(breakdown.status()).toBe(200);
    expectStructure(await breakdown.json(), PAYOUT_BREAKDOWN);
});
