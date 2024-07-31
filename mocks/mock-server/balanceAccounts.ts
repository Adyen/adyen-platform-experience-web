import { BALANCE_ACCOUNTS, BALANCES } from '../mock-data';
import { endpoints } from '../../playground/endpoints/endpoints';
import { delay } from './utils';
import { http, HttpResponse } from 'msw';

const mockEndpoints = endpoints('mock');
const networkError = false;

export const balanceAccountMock = [
    http.get(mockEndpoints.balanceAccounts, async () => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(200);
        return HttpResponse.json({
            data: BALANCE_ACCOUNTS,
        });
    }),
    http.get(mockEndpoints.balances, async ({ params }) => {
        const balanceAccountId = params.id as string;
        return HttpResponse.json({
            data: BALANCES[balanceAccountId],
        });
    }),
];
