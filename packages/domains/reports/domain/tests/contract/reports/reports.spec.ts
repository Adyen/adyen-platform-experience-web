import { sessionAwareTest } from '@integration-components/testing/playwright/session-request-function';
import { getRequestURL } from '@integration-components/testing/playwright/contract-utils';
import { expectNonEmpty, expectStructure, recentDateRange } from '@integration-components/testing/playwright/contract-structure';
import { SuccessResponse } from '@integration-components/types/api/endpoints';
import { APIRequestContext, expect } from '@playwright/test';
import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config({ path: './envs/.env' });

const balanceAccountId = process.env.BALANCE_ACCOUNT || '';
const REPORT_TYPE = 'payout';

// Structure templates: only the fields and their types matter, the values are placeholders.
const REPORT: NonNullable<SuccessResponse<'getReports'>['data']>[number] = { createdAt: '', type: REPORT_TYPE };
const REPORT_CSV_COLUMNS =
    'BalancePlatform,AccountHolder,BalanceAccount,AccountHolder Reference,AccountHolder Description,BalanceAccount Reference,BalanceAccount Description,Transfer Id,Transaction Id,Booking date,Booking date TimeZone,Value date,Value date TimeZone,Category,Type,Status,Currency,Balance (PC),Rolling Balance,Reference,Description,Counterparty Balance Account Id,Psp Payment Merchant Reference,Psp Payment Psp Reference,Payout Date,Psp Modification Psp Reference,Psp Modification Merchant Reference';

const getRecentReports = async (requestContext: APIRequestContext, headers?: Record<string, string>) => {
    const response = await requestContext.get(
        getRequestURL({
            version: 1,
            method: 'get',
            endpoint: '/reports',
            params: { query: { balanceAccountId, type: REPORT_TYPE, ...recentDateRange(180) } },
        }),
        { headers }
    );

    expect(response.status()).toBe(200);
    return response.json() as Promise<SuccessResponse<'getReports'>>;
};

sessionAwareTest('/reports endpoint should return reports with the expected structure', async ({ requestContext, headers }) => {
    const reports = await getRecentReports(requestContext, headers);

    expectStructure(reports, { data: [REPORT] });
    expectNonEmpty(reports.data, 'payout reports in the last 180 days');
});

sessionAwareTest('/reports/download endpoint should return a CSV with the expected columns', async ({ requestContext, headers }) => {
    const [report] = expectNonEmpty((await getRecentReports(requestContext, headers)).data, 'payout reports in the last 180 days');

    const download = await requestContext.get(
        getRequestURL({
            version: 1,
            method: 'get',
            endpoint: '/reports/download',
            params: { query: { balanceAccountId, createdAt: new Date(report!.createdAt).toISOString(), type: REPORT_TYPE } },
        }),
        { headers }
    );

    const responseHeaders = download.headers();
    const [csvColumnRow = ''] = (await download.body()).toString().split('\n');

    expect(download.status()).toBe(200);
    expect(responseHeaders['content-type']).toMatch(/^text\/csv/);
    expect(responseHeaders['content-disposition']).toMatch(
        new RegExp(`^attachment; filename=balanceaccount_${REPORT_TYPE}_report_\\d{4}_\\d{2}_\\d{2}\\.csv$`)
    );
    expect(csvColumnRow.trim()).toBe(REPORT_CSV_COLUMNS);
});
