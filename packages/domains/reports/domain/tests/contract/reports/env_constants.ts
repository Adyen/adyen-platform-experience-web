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
    report_download_first_row: Buffer;
    reportType: typeof REPORT_TYPE;
}

const REPORT_TYPE = 'payout';

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
    // Base64 keeps account holder names and PSP references out of the source as plain text.
    report_download_first_row: Buffer.from(
        'VGVzdEJhbGFuY2VQbGF0Zm9ybUFmUCxBSDMyMlZIMjIzMjI2UzVLR0I2Rk4zSENQLEJBMzIyVkoyMjMyMjZTNUtHQjZINDkyQ0wsVmFzaGlzaHQgTGFraG1hbmksLCxVU0QgdGVzdGluZywzREw3WVc2MlhQWk1LSU5LLEVWSk40MkJYSDIyNDIyM0Y1S1A5WEgzM0JSNlJTMlVTRCwyMDI0LTA1LTE0IDExOjM1OjA5LENFU1QsMjAyNC0wNS0xNCAxMTozNTowOCxDRVNULGJhbmssYmFua1RyYW5zZmVyLGJvb2tlZCxVU0QsLTAuNSwwLjQ3LFNXUEU0MjNDRDIyMzJLNUQ1S1A5WEMzM1MzNUc4UixTV1BFNDIzQ0QyMjMySzVENUtQOVhDMzNTMzVHOFIsLCwsMjAyNC0wNS0xNCAxMTozNTowOCws',
        'base64'
    ),
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
    // Base64 keeps account holder names and PSP references out of the source as plain text.
    report_download_first_row: Buffer.from(
        'UElFRWF0cyxBSDMyQ05CMjIzMjI3TjVLWjJNREo2UUNLLEJBMzJDTlAyMjMyMjdONUtaMk5EVzc3UFIsUy5FbGxlci0wMDEsQWNjb3VudCBob2xkZXIgZm9yIGEgc2VsbGVyIGluIFBpZUVhdHMgcGxhdGZvcm0sLFMuRWxsZXIgLSBNYWluIGJhbGFuY2UgYWNjb3VudCwzOEU5NjQ2Qzg4VzBDUlNMLEVWSk40MkNMVDIyMzIyNEg1UFdSNUxRQ1M3Mk5RQkVVUiwyMDI2LTA5LTA0IDA3OjAxOjU2LENFU1QsMjAyNi0wOS0wNCAwNzowMTo1NixDRVNULHBsYXRmb3JtUGF5bWVudCxjYXB0dXJlLGNhcHR1cmVkLEVVUiw4Ljk0LDM5LjU1LGR0cC0yMDI2LTA5LTA0VDA3OjAxOjQ2LjYzNTIwNjgwNi1zdWJtZXJjaGFudC1zcGxpdCwsLGR0cC0yMDI2LTA5LTA0VDA3OjAxOjQ2LjYzNTIwNjgwNixQN0JXOFI5SkY2QkNMR1Y1LDIwMjYtMDktMDcgMDc6MDA6MDQsUjMzMko4TjY0Q05MNVFUNSw8YXV0bz4=',
        'base64'
    ),
    reportType: REPORT_TYPE,
};

export const ENVS = {
    live: LIVE,
    test: TEST,
};
