import { BALANCE_ACCOUNTS } from '../mock-data/balanceAccounts';
import { endpoints } from '../../endpoints/endpoints';
import { delay } from './utils/utils';
import { http, HttpResponse } from 'msw';

const mockEndpoints = endpoints();

export const balanceAccountMock = [
    http.get(mockEndpoints.balanceAccounts, async () => {
        await delay(200);
        return HttpResponse.json({
            data: BALANCE_ACCOUNTS,
        });
    }),
];
