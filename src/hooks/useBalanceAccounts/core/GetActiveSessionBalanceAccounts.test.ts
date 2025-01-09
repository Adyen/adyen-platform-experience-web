import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    ERR_BALANCE_ACCOUNTS_UNAVAILABLE,
    ERR_GET_BALANCE_ACCOUNTS_UNAUTHORIZED,
    getActiveSessionBalanceAccounts,
    getActiveSessionBalanceAccountsFactory,
} from './GetActiveSessionBalanceAccounts';
import {
    createMockServerContext,
    createMockSessionContext,
    MockSessionContext,
} from '../../../core/Auth/session/utils/__testing__/MockSessionTestUtils';

describe.todo('getActiveSessionBalanceAccounts', () => {
    const { initializeServer, mockServer, useEndpoints } = createMockServerContext();

    initializeServer();

    beforeEach<MockSessionContext>(async ctx => void (await createMockSessionContext(ctx)));

    it.todo('should throw an error if not authorized to get balance accounts', () => {});

    it.todo('should throw an error if failed retrieve balance accounts', () => {});

    it.todo('should only get balance accounts once per active session', () => {});
});

describe.todo('getActiveSessionBalanceAccountsFactory', () => {});
