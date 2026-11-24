import { AuthSession } from '@integration-components/core';
import sessionReady from '@integration-components/core/session/utils/sessionReady';
import { EMPTY_OBJECT } from '@integration-components/utils';
import type { ICashOutUnavailableReason, ISessionAccount } from '@integration-components/types';

/**
 * Like Capital, whether the CashOut components are available to the session: `{ isAvailable: false }` when it has no CashOut
 * role, or the state could not be told.
 *
 * Once available, `restrictions` tells all the reasons the account holder of the session cannot cash out at all, the most
 * blocking first: those of its platform and of the account holder itself, the same for each of its balance accounts. The
 * components tell what keeps a single balance account from cashing out for now, like its balance. More restrictions may be told
 * in the future, so the platform decides which of them hide the components instead of hiding them for any.
 */
export type ExternalCashOutState = { isAvailable: false } | { isAvailable: true; restrictions: ICashOutUnavailableReason[] };

type Endpoints = AuthSession['context']['endpoints'];

const NOT_AVAILABLE = { isAvailable: false } as const satisfies ExternalCashOutState;

// One request per session at a time, so the components of a page asking at once share it, while a later call asks again.
const pendingStates = new WeakMap<AuthSession, Promise<ExternalCashOutState>>();

// The state is told for the account holder of the session, or for its balance account, whose account holder the API tells it for.
const getSessionAccountKey = async (getAccounts: NonNullable<Endpoints['getAccounts']>) => {
    const { data } = await getAccounts(EMPTY_OBJECT);
    const byType = (accountType: ISessionAccount['accountType']) => data.find((account: ISessionAccount) => account.accountType === accountType);
    return (byType('BalanceAccountHolder') ?? byType('BalanceAccount'))?.accountKey;
};

// getState() never fails: whatever keeps the state from being told, the platform is told the components aren't available.
const loadExternalCashOutState = async (session: AuthSession): Promise<ExternalCashOutState> => {
    try {
        await sessionReady(session);
        const { getAccounts, getCashOutState } = session.context.endpoints;
        if (!getAccounts || !getCashOutState) return NOT_AVAILABLE;

        const accountKey = await getSessionAccountKey(getAccounts);
        if (!accountKey) return NOT_AVAILABLE;
        const { unavailableReasons } = await getCashOutState(EMPTY_OBJECT, { path: { accountKey } });
        // The reasons are required, but a response without them must not reach the platform as restrictions it can't rely on
        return { isAvailable: true, restrictions: unavailableReasons ?? [] };
    } catch {
        return NOT_AVAILABLE;
    }
};

export const getExternalCashOutState = (session: AuthSession): Promise<ExternalCashOutState> => {
    let pending = pendingStates.get(session);
    if (!pending) {
        pending = loadExternalCashOutState(session).finally(() => pendingStates.delete(session));
        pendingStates.set(session, pending);
    }
    return pending;
};
