import type { IBalanceAccountBase } from '@integration-components/types';
import { abortSignalForAny } from '@integration-components/utils';
import type { ConfigController } from './setupConfig';

export type BalanceAccountsSnapshot = Readonly<{
    accounts?: readonly IBalanceAccountBase[];
    error?: Error;
    loading: boolean;
}>;

export interface BalanceAccountsController {
    getSnapshot(): BalanceAccountsSnapshot;
    reload(): void;
    subscribe(listener: (snapshot: BalanceAccountsSnapshot) => void): () => void;
}

export const createBalanceAccounts = (configController: ConfigController, signal: AbortSignal): BalanceAccountsController => {
    const listeners = new Set<(snapshot: BalanceAccountsSnapshot) => void>();
    let snapshot: BalanceAccountsSnapshot = { accounts: undefined, error: undefined, loading: true };
    let loadController: AbortController | undefined;
    let loadVersion = 0;

    const publish = (nextSnapshot: BalanceAccountsSnapshot) => {
        snapshot = nextSnapshot;
        listeners.forEach(listener => listener(snapshot));
    };
    const load = async () => {
        loadController?.abort();
        loadController = new AbortController();
        const version = ++loadVersion;
        publish({ accounts: snapshot.accounts, error: undefined, loading: true });
        try {
            const endpoint = configController.getSnapshot().contextValue.endpoints.getBalanceAccounts;
            if (!endpoint) throw new Error('Balance accounts endpoint is unavailable');
            const response = await endpoint({ signal: abortSignalForAny([signal, loadController.signal]) });
            if (version === loadVersion) publish({ accounts: response.data, error: undefined, loading: false });
        } catch (error) {
            if (version === loadVersion && !signal.aborted) {
                publish({ accounts: snapshot.accounts, error: error as Error, loading: false });
            }
        }
    };
    signal.addEventListener(
        'abort',
        () => {
            loadController?.abort();
            loadVersion++;
            listeners.clear();
        },
        { once: true }
    );
    void load();

    return {
        getSnapshot: () => snapshot,
        reload: () => void load(),
        subscribe: listener => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
};
