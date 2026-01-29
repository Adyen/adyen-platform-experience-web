import { BALANCE_ACCOUNTS, BALANCES } from '../mock-data';
import { endpoints } from '../../endpoints/endpoints';
import { delay } from './utils/utils';
import { http, HttpResponse } from 'msw';

const mockEndpoints = endpoints();
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
