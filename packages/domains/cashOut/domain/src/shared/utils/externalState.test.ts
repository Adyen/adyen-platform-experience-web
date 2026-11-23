import { describe, expect, test, vi } from 'vitest';
import { AuthSession } from '@integration-components/core';
import { EMPTY_OBJECT } from '@integration-components/utils';
import type { ICashOutState, ISessionAccount } from '@integration-components/types';
import { STATE_RESTRICTED, STATE_WITHOUT_RESTRICTIONS } from '../../../../mocks/mock-data/cashOut';
import { getExternalCashOutState } from './externalState';

const ACCOUNT_HOLDER: ISessionAccount = { accountKey: 'BalanceAccountHolder.AH00000000000000000000001', accountType: 'BalanceAccountHolder' };
const BALANCE_ACCOUNT: ISessionAccount = { accountKey: 'BalanceAccount.BA00000000000000000000001', accountType: 'BalanceAccount' };

const createSession = (endpoints: { getAccounts?: unknown; getCashOutState?: unknown }) =>
    ({
        context: { endpoints, isExpired: false, refreshing: false },
        refresh: vi.fn(),
        subscribe: vi.fn((callback: (value: unknown) => void) => {
            callback({});
            return vi.fn();
        }),
    }) as unknown as AuthSession;

const createEndpoints = ({
    accounts = [ACCOUNT_HOLDER],
    state = STATE_WITHOUT_RESTRICTIONS,
}: { accounts?: ISessionAccount[]; state?: ICashOutState } = {}) => ({
    getAccounts: vi.fn().mockResolvedValue({ data: accounts }),
    getCashOutState: vi.fn().mockResolvedValue(state),
});

describe('getExternalCashOutState', () => {
    test('tells the state of the account holder of the session', async () => {
        const endpoints = createEndpoints();

        await expect(getExternalCashOutState(createSession(endpoints))).resolves.toEqual({ isAvailable: true, restrictions: [] });
        expect(endpoints.getCashOutState).toHaveBeenCalledWith(EMPTY_OBJECT, { path: { accountKey: ACCOUNT_HOLDER.accountKey } });
    });

    // The API tells the state of its account holder
    test('asks for the balance account of a session for a balance account', async () => {
        const endpoints = createEndpoints({ accounts: [BALANCE_ACCOUNT] });

        await getExternalCashOutState(createSession(endpoints));

        expect(endpoints.getCashOutState).toHaveBeenCalledWith(EMPTY_OBJECT, { path: { accountKey: BALANCE_ACCOUNT.accountKey } });
    });

    test('asks for the account holder when the session has both', async () => {
        const endpoints = createEndpoints({ accounts: [BALANCE_ACCOUNT, ACCOUNT_HOLDER] });

        await getExternalCashOutState(createSession(endpoints));

        expect(endpoints.getCashOutState).toHaveBeenCalledWith(EMPTY_OBJECT, { path: { accountKey: ACCOUNT_HOLDER.accountKey } });
    });

    // Still available: the platform decides which restrictions hide the components
    test('tells all the reasons it cannot cash out as restrictions, as the API tells them', async () => {
        await expect(getExternalCashOutState(createSession(createEndpoints({ state: STATE_RESTRICTED })))).resolves.toEqual({
            isAvailable: true,
            restrictions: STATE_RESTRICTED.unavailableReasons,
        });
    });

    // Like Capital, without restrictions: the platform can't tell more than that the components can't be shown
    test('is not available without the CashOut role', async () => {
        const { getAccounts } = createEndpoints();

        await expect(getExternalCashOutState(createSession({ getAccounts }))).resolves.toEqual({ isAvailable: false });
        expect(getAccounts).not.toHaveBeenCalled();
    });

    test('is not available when the state cannot be told', async () => {
        const endpoints = createEndpoints();
        endpoints.getCashOutState.mockRejectedValue(new Error('Request failed'));

        await expect(getExternalCashOutState(createSession(endpoints))).resolves.toEqual({ isAvailable: false });
    });

    test('is not available when the account of the session cannot be told', async () => {
        const failingAccounts = createEndpoints();
        failingAccounts.getAccounts.mockRejectedValue(new Error('Request failed'));
        const withoutAccounts = createEndpoints({ accounts: [] });

        await expect(getExternalCashOutState(createSession(failingAccounts))).resolves.toEqual({ isAvailable: false });
        await expect(getExternalCashOutState(createSession(withoutAccounts))).resolves.toEqual({ isAvailable: false });
        expect(failingAccounts.getCashOutState).not.toHaveBeenCalled();
        expect(withoutAccounts.getCashOutState).not.toHaveBeenCalled();
    });

    // Not as the API tells it, but so getState() always tells restrictions the platform can rely on
    test('tells a state without its reasons as available without restrictions', async () => {
        const state = {} as ICashOutState;

        await expect(getExternalCashOutState(createSession(createEndpoints({ state })))).resolves.toEqual({ isAvailable: true, restrictions: [] });
    });

    test('is not available when the session cannot be made ready, instead of failing', async () => {
        const endpoints = createEndpoints();
        const session = {
            context: { endpoints, isExpired: false, refreshing: false },
            refresh: vi.fn(),
            subscribe: vi.fn(() => {
                throw new Error('Session failed');
            }),
        } as unknown as AuthSession;

        await expect(getExternalCashOutState(session)).resolves.toEqual({ isAvailable: false });
        expect(endpoints.getCashOutState).not.toHaveBeenCalled();
    });

    // So the Overview and the Request of a page asking at once make one request, while a later call tells the state as it is then
    test('shares a request in progress, and asks again once it is done', async () => {
        const endpoints = createEndpoints();
        const session = createSession(endpoints);

        const [first, second] = await Promise.all([getExternalCashOutState(session), getExternalCashOutState(session)]);
        expect(first).toEqual({ isAvailable: true, restrictions: [] });
        expect(second).toEqual({ isAvailable: true, restrictions: [] });
        expect(endpoints.getCashOutState).toHaveBeenCalledTimes(1);

        await getExternalCashOutState(session);
        expect(endpoints.getCashOutState).toHaveBeenCalledTimes(2);
    });
});
