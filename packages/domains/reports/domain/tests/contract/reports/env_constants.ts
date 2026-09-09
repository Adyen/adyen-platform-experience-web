import { SuccessResponse } from '@integration-components/types/api/endpoints';
import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config({ path: './envs/.env' });

interface ReportsVariables {
    balanceAccountId: string;
    createdSince: string;
    createdUntil: string;
    reportCreationDate: string;
    reports_list_response: SuccessResponse<'getReports'>['data'];
    report_download_columns: string;
    reportType: typeof REPORT_TYPE;
}

const REPORT_TYPE = 'payout';

// The report body is live data that changes on every run, so only the column row is pinned.
const REPORT_CSV_COLUMNS =
    'BalancePlatform,AccountHolder,BalanceAccount,AccountHolder Reference,AccountHolder Description,BalanceAccount Reference,BalanceAccount Description,Transfer Id,Transaction Id,Booking date,Booking date TimeZone,Value date,Value date TimeZone,Category,Type,Status,Currency,Balance (PC),Rolling Balance,Reference,Description,Counterparty Balance Account Id,Psp Payment Merchant Reference,Psp Payment Psp Reference,Payout Date,Psp Modification Psp Reference,Psp Modification Merchant Reference';

const LIVE: ReportsVariables = {
    balanceAccountId: process.env.BALANCE_ACCOUNT || '',
    createdSince: '2024-05-14T00:00:00.000Z',
    createdUntil: '2024-05-14T23:59:59.999Z',
    reportCreationDate: '2024-05-14T00:00:00.000Z',
    reports_list_response: [
        {
            createdAt: '2024-05-14T00:00:00.000+00:00',
            type: REPORT_TYPE,
        },
    ],
    report_download_columns: REPORT_CSV_COLUMNS,
    reportType: REPORT_TYPE,
};

const TEST: ReportsVariables = {
    balanceAccountId: process.env.BALANCE_ACCOUNT || '',
    createdSince: '2024-12-11T00:00:00.000Z',
    createdUntil: '2026-09-07T00:00:00.000Z',
    reportCreationDate: '2026-09-07T00:00:00.000Z',
    reports_list_response: [
        {
            createdAt: '2026-09-07T00:00:00.000+00:00',
            type: REPORT_TYPE,
        },
    ],
    report_download_columns: REPORT_CSV_COLUMNS,
    reportType: REPORT_TYPE,
};

export const ENVS = {
    live: LIVE,
    test: TEST,
};
