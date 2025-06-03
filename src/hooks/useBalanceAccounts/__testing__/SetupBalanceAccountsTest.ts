import { beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import type { IBalanceAccountBase } from '../../../types';
import {
    BASE_URL,
    createMockServerContext,
    createMockSessionContext,
    MockSessionContext,
} from '../../../core/ConfigContext/session/__testing__/MockSessionTestUtils';

export function setupBalanceAccountsTest() {
    const { initializeServer, mockServer, useEndpoints } = createMockServerContext();

    const useBalanceAccounts = (data?: IBalanceAccountBase[]) => {
        const endpoint = 'balanceAccounts';

        useEndpoints({
            getBalanceAccounts: {
                method: 'GET',
                url: endpoint,
            },
        });

        mockServer.use(http.get(`${BASE_URL}/${endpoint}`, () => HttpResponse.json({ data })));
    };

    initializeServer();

    beforeEach<MockSessionContext>(async ctx => {
        await createMockSessionContext(ctx);
    });

    return { useBalanceAccounts };
}

export default setupBalanceAccountsTest;
