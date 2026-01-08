import { expect } from '@playwright/test';
import { ENVS } from './env_constants';
import process from 'node:process';
import dotenv from 'dotenv';
import { sessionAwareTest } from '../utils/session-request-function';
import { getRequestURL } from '../utils/utils';

dotenv.config({ path: './envs/.env' });

const environment = process.env.NODE_ENV as 'live' | 'test';

const ENV = ENVS[environment] || ENVS.test;

sessionAwareTest('/reports endpoint should return consistent data', async ({ requestContext, headers }) => {
    const reportsList = await requestContext.get(
        getRequestURL({
            method: 'get',
            endpoint: '/reports',
            params: {
                query: {
                    balanceAccountId: ENV.balanceAccountId,
                    createdSince: ENV.createdSince,
                    createdUntil: ENV.createdUntil,
                    type: ENV.reportType,
                },
            },
            version: 1,
        }),
        { headers }
    );

    expect(reportsList.status()).toBe(200);

    const responseData = await reportsList.json();

    expect(responseData).toHaveProperty('data');
    expect(responseData.data[0]).toStrictEqual(ENV.reports_list_response![0]);
});

sessionAwareTest('/reports/download endpoint should return consistent data', async ({ requestContext, headers }) => {
    const reportDownload = await requestContext.get(
        getRequestURL({
            method: 'get',
            endpoint: '/reports/download',
            params: {
                query: { balanceAccountId: ENV.balanceAccountId, createdAt: ENV.reportCreationDate, type: ENV.reportType },
            },
            version: 1,
        }),
        { headers }
    );

    expect(reportDownload.status()).toBe(200);

    const responseHeaders = reportDownload.headers();
    const reportFilenameDateFragment = new Date(ENV.reportCreationDate).toISOString().split('T')[0]!.replace(/-/g, '_');

    expect(responseHeaders).toMatchObject({
        'content-disposition': `attachment; filename=balanceaccount_${ENV.reportType}_report_${reportFilenameDateFragment}.csv`,
        'content-type': 'text/csv;charset=UTF-8',
    });

    const responseData = await reportDownload.body();

    expect(responseData.toString()).toStrictEqual(ENV.report_download_response.toString());
});
