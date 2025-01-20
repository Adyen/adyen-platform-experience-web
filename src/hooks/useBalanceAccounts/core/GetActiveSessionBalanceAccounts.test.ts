import { describe, expect, it } from 'vitest';
import { BALANCE_ACCOUNTS } from '../../../../mocks/mock-data';
import { MockSessionContext } from '../../../core/Auth/session/__testing__/MockSessionTestUtils';
import setupBalanceAccountsTest from '../__testing__/SetupBalanceAccountsTest';
import {
    ERR_BALANCE_ACCOUNTS_UNAVAILABLE,
    ERR_GET_BALANCE_ACCOUNTS_UNAUTHORIZED,
    getActiveSessionBalanceAccounts,
    getActiveSessionBalanceAccountsFactory,
} from './GetActiveSessionBalanceAccounts';

describe('getActiveSessionBalanceAccounts', () => {
    const { useBalanceAccounts } = setupBalanceAccountsTest();

    it<MockSessionContext>('should throw an error if not authorized to get balance accounts', async ({ expireSession, refreshSession, session }) => {
        const testExpectations = async (sessionExpire = false) => {
            if (sessionExpire) expireSession();
            await expect(getActiveSessionBalanceAccounts(session)).rejects.toThrowError(ERR_GET_BALANCE_ACCOUNTS_UNAUTHORIZED);
        };

        await refreshSession();
        await testExpectations(); // with active session
        await testExpectations(true); // with expired session
    });

    it<MockSessionContext>('should throw an error if failed retrieve balance accounts', async ({ expireSession, refreshSession, session }) => {
        const testExpectations = async (sessionExpire = false) => {
            if (sessionExpire) expireSession();
            await expect(getActiveSessionBalanceAccounts(session)).rejects.toThrowError(ERR_BALANCE_ACCOUNTS_UNAVAILABLE);
        };

        useBalanceAccounts();

        await refreshSession();
        await testExpectations(); // with active session
        await testExpectations(true); // with expired session
    });

    it<MockSessionContext>('should always get balance accounts fresh from server with right permissions', async ({
        expireSession,
        refreshSession,
        session,
    }) => {
        const getBalanceAccounts = async (sessionExpire: boolean) => {
            if (sessionExpire) expireSession();

            const balanceAccounts = await getActiveSessionBalanceAccounts(session); // fresh from server
            expect(balanceAccounts).toStrictEqual(BALANCE_ACCOUNTS);
            return balanceAccounts;
        };

        const testExpectations = async (sessionExpire = false) => {
            let balanceAccounts = await getBalanceAccounts(sessionExpire);

            for (let i = 0; i < 3; i++) {
                const previousBalanceAccounts = balanceAccounts;
                balanceAccounts = await getBalanceAccounts(sessionExpire);
                expect(balanceAccounts).not.toBe(previousBalanceAccounts); // fresh data
            }
        };

        useBalanceAccounts(BALANCE_ACCOUNTS);

        await refreshSession();
        await testExpectations(); // with active session
        await testExpectations(true); // with expired session
    });
});

describe('getActiveSessionBalanceAccountsFactory', () => {
    const { useBalanceAccounts } = setupBalanceAccountsTest();

    it<MockSessionContext>('should return the same function for same core instance', ({ session }) => {
        const getBalanceAccounts_1 = getActiveSessionBalanceAccountsFactory(session);
        const getBalanceAccounts_2 = getActiveSessionBalanceAccountsFactory(session);
        expect(getBalanceAccounts_1).toBe(getBalanceAccounts_2);
    });

    it<MockSessionContext>('should return function with expected methods', ({ session }) => {
        const getBalanceAccounts = getActiveSessionBalanceAccountsFactory(session);

        (['fresh', 'reset'] as const).forEach(method => {
            expect(getBalanceAccounts).toHaveProperty(method);
            expect(getBalanceAccounts[method]).toBeInstanceOf(Function);
        });
    });

    it<MockSessionContext>('returned function should fetch balance accounts once per active session', async ({
        expireSession,
        refreshSession,
        session,
    }) => {
        const getBalanceAccounts = getActiveSessionBalanceAccountsFactory(session);
        let balanceAccounts: Awaited<ReturnType<typeof getBalanceAccounts>>;

        const getCurrentBalanceAccounts = async () => {
            const balanceAccounts = await getBalanceAccounts();
            expect(balanceAccounts).toStrictEqual(BALANCE_ACCOUNTS);
            return balanceAccounts;
        };

        const testExpectations = async () => {
            let previousBalanceAccounts = balanceAccounts;

            // fetched fresh from server (will begin a new session if necessary)
            balanceAccounts = await getCurrentBalanceAccounts();

            expect(balanceAccounts).not.toBe(previousBalanceAccounts); // fresh data

            for (let i = 0; i < 3; i++) {
                previousBalanceAccounts = balanceAccounts;
                balanceAccounts = await getCurrentBalanceAccounts(); // skip server fetch
                expect(balanceAccounts).toBe(previousBalanceAccounts); // same data
            }
        };

        useBalanceAccounts(BALANCE_ACCOUNTS);

        // begin new session
        await refreshSession();
        await testExpectations();

        // expire current session
        expireSession();
        await testExpectations();
    });

    it<MockSessionContext>('fresh() method should always fetch balance accounts afresh from the server', async ({
        expireSession,
        refreshSession,
        session,
    }) => {
        const getBalanceAccounts = getActiveSessionBalanceAccountsFactory(session);
        let balanceAccounts: Awaited<ReturnType<typeof getBalanceAccounts>>;

        const getCurrentBalanceAccounts = async () => {
            const balanceAccounts = await getBalanceAccounts.fresh();
            expect(balanceAccounts).toStrictEqual(BALANCE_ACCOUNTS);
            return balanceAccounts;
        };

        const testExpectations = async () => {
            for (let i = 0; i < 3; i++) {
                const previousBalanceAccounts = balanceAccounts;
                balanceAccounts = await getCurrentBalanceAccounts(); // fetch from server (always)
                expect(balanceAccounts).not.toBe(previousBalanceAccounts); // fresh data
            }
        };

        useBalanceAccounts(BALANCE_ACCOUNTS);

        // begin new session
        await refreshSession();
        await testExpectations();

        // expire current session
        expireSession();
        await testExpectations();
    });

    it<MockSessionContext>('reset() method should cause to fetch balance accounts afresh from the server', async ({ refreshSession, session }) => {
        const getBalanceAccounts = getActiveSessionBalanceAccountsFactory(session);
        let balanceAccounts: Awaited<ReturnType<typeof getBalanceAccounts>>;

        const getCurrentBalanceAccounts = async () => {
            const balanceAccounts = await getBalanceAccounts();
            expect(balanceAccounts).toStrictEqual(BALANCE_ACCOUNTS);
            return balanceAccounts;
        };

        const testExpectations = async () => {
            const previousBalanceAccounts = balanceAccounts;

            // fetched fresh from server (will begin a new session if necessary)
            balanceAccounts = await getCurrentBalanceAccounts();

            expect(balanceAccounts).not.toBe(previousBalanceAccounts); // fresh data
        };

        useBalanceAccounts(BALANCE_ACCOUNTS);

        // begin new session
        await refreshSession();
        await testExpectations();

        for (let i = 0; i < 3; i++) {
            // reset and fetch again
            getBalanceAccounts.reset();
            await testExpectations();
        }
    });
});
