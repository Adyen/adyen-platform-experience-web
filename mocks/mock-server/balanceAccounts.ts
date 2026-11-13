import { BALANCE_ACCOUNTS, BALANCES } from '../mock-data';
import { endpoints } from '../../endpoints/endpoints';
import { http, HttpResponse } from 'msw';
import { withDelay } from '@integration-components/testing/msw';

const mockEndpoints = endpoints();
const networkError = false;

export const balanceAccountMock = [
    http.get(
        mockEndpoints.balanceAccounts,
        withDelay(() => {
            if (networkError) {
                return HttpResponse.error();
            }
            return HttpResponse.json({
                data: BALANCE_ACCOUNTS,
            });
        })
    ),
    http.get(
        mockEndpoints.balances,
        withDelay(({ params }) => {
            const balanceAccountId = params.id as string;
            return HttpResponse.json({
                data: BALANCES[balanceAccountId],
            });
        })
    ),
];
