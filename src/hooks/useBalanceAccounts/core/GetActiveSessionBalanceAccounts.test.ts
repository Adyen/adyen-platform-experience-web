import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { Core } from '../../../core';
import { IBalanceAccountBase } from '../../../types';
import { BALANCE_ACCOUNTS } from '../../../../mocks/mock-data';
import {
    ERR_BALANCE_ACCOUNTS_UNAVAILABLE,
    ERR_GET_BALANCE_ACCOUNTS_UNAUTHORIZED,
    getActiveSessionBalanceAccounts,
    getActiveSessionBalanceAccountsFactory,
} from './GetActiveSessionBalanceAccounts';
import {
    BASE_URL,
    createMockServerContext,
    createMockSessionContext,
    MockSessionContext,
} from '../../../core/Auth/session/__testing__/MockSessionTestUtils';

describe('getActiveSessionBalanceAccounts', () => {
    type ExtendedTestContext = MockSessionContext & { core: Core<any, any> };

    const { initializeServer, mockServer, useEndpoints } = createMockServerContext();

    const useBalanceAccounts = (data?: IBalanceAccountBase[]) => {
        const balanceAccountsEndpoint = 'balanceAccounts';

        useEndpoints({
            getBalanceAccounts: {
                method: 'GET',
                url: balanceAccountsEndpoint,
            },
        });

        mockServer.use(http.get(`${BASE_URL}/${balanceAccountsEndpoint}`, () => HttpResponse.json({ data })));
    };

    initializeServer();

    beforeEach<ExtendedTestContext>(async ctx => {
        await createMockSessionContext(ctx);
        const core = new Core({ onSessionCreate: ctx.session.onSessionCreate! });
        ctx.core = core;

        vi.spyOn(core, 'session', 'get').mockReturnValue(ctx.session);
    });

    it<ExtendedTestContext>('should throw an error if not authorized to get balance accounts', ({ core }) => {
        expect(getActiveSessionBalanceAccounts(core)).rejects.toThrowError(ERR_GET_BALANCE_ACCOUNTS_UNAUTHORIZED);
    });

    it<ExtendedTestContext>('should throw an error if failed retrieve balance accounts', ({ core }) => {
        useBalanceAccounts();
        expect(getActiveSessionBalanceAccounts(core)).rejects.toThrowError(ERR_BALANCE_ACCOUNTS_UNAVAILABLE);
    });

    it<ExtendedTestContext>('should only get balance accounts once per active session', async ({ core }) => {
        useBalanceAccounts(BALANCE_ACCOUNTS);

        const balanceAccounts = await getActiveSessionBalanceAccounts(core);

        // Received correct balance accounts the first time in the current session
        expect(balanceAccounts).toMatchObject(BALANCE_ACCOUNTS);

        for (let i = 0; i < 3; i++) {
            const _balanceAccounts = await getActiveSessionBalanceAccounts(core);

            // Return the earlier received balance accounts without hitting the server again
            expect(_balanceAccounts).toStrictEqual(balanceAccounts);
        }
    });
});

describe.todo('getActiveSessionBalanceAccountsFactory', () => {});
