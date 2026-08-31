import { createBalanceAccounts, createConfigController, setupConfigAnalytics, type EndpointHttpCallables } from '@integration-components/core';
import { createDomainTranslations, type CoreInstance } from '@integration-components/core/vue';
import {
    TRANSACTIONS_EN_US,
    TRANSACTIONS_PROTECTED_TRANSLATION_KEYS,
    TRANSACTIONS_TRANSLATION_LOADERS,
    type TransactionsTranslationKey,
    type TransactionsTranslationLocale,
} from '@integration-components/transactions/domain';
import type {
    TransactionsDependencies,
    TransactionsRuntime,
    TransactionsRuntimeSnapshot,
} from '@integration-components/transactions/vue/definitions';
import type { ExternalComponentType } from '@integration-components/types';
import { abortSignalForAny } from '@integration-components/utils';
import { createTransactionsCallbacks } from './createTransactionsCallbacks';

const createTransactionsRuntime = (
    configController: ReturnType<typeof createConfigController>,
    signal: AbortSignal,
    reloadBalanceAccounts: () => void
): TransactionsRuntime => {
    let wasRefreshing = configController.getSnapshot().contextValue.refreshing;

    const getSnapshot = (): TransactionsRuntimeSnapshot => {
        const snapshot = configController.getSnapshot();
        const endpoints = snapshot.contextValue.endpoints;
        return {
            available: snapshot.hasPermission,
            canDownload: !!endpoints.downloadTransactions,
            canGetBalances: !!endpoints.getBalances,
            canGetTotals: !!endpoints.getTransactionTotals,
            canRefund: !!endpoints.initiateRefund,
            refreshing: snapshot.contextValue.refreshing,
        };
    };

    return {
        downloadTransactions: ({ signal: requestSignal, ...query }) => {
            const endpoint = configController.getSnapshot().contextValue.endpoints.downloadTransactions;
            if (!endpoint) throw new Error('Download transactions endpoint is unavailable');
            type Query = Parameters<EndpointHttpCallables<'downloadTransactions'>>[1]['query'];
            return endpoint({ signal: abortSignalForAny([signal, requestSignal]) }, { query: query as unknown as Query });
        },
        getBalances: async ({ balanceAccountId, signal: requestSignal }) => {
            const endpoint = configController.getSnapshot().contextValue.endpoints.getBalances;
            if (!endpoint) throw new Error('Balances endpoint is unavailable');
            const response = await endpoint({ signal: abortSignalForAny([signal, requestSignal]) }, { path: { balanceAccountId } });
            return response?.data ?? [];
        },
        getSnapshot,
        getTransaction: ({ signal: requestSignal, transactionId }) => {
            const endpoint = configController.getSnapshot().contextValue.endpoints.getTransaction;
            if (!endpoint) throw new Error('Transaction details endpoint is unavailable');
            return endpoint({ signal: abortSignalForAny([signal, requestSignal]) }, { path: { transactionId } });
        },
        getTransactions: ({ signal: requestSignal, ...request }) => {
            const endpoint = configController.getSnapshot().contextValue.endpoints.getTransactions;
            if (!endpoint) throw new Error('Transactions endpoint is unavailable');
            type Query = Parameters<EndpointHttpCallables<'getTransactions'>>[1]['query'];
            const query = {
                ...request,
                categories: request.categories.length ? [...request.categories] : undefined,
                currencies: request.currencies.length ? [...request.currencies] : undefined,
                statuses: request.statuses.length ? [...request.statuses] : undefined,
            } as unknown as Query;
            return endpoint({ signal: abortSignalForAny([signal, requestSignal]) }, { query });
        },
        getTransactionsTotals: ({ signal: requestSignal, ...request }) => {
            const endpoint = configController.getSnapshot().contextValue.endpoints.getTransactionTotals;
            if (!endpoint) throw new Error('Transaction totals endpoint is unavailable');
            type Query = Parameters<EndpointHttpCallables<'getTransactionTotals'>>[1]['query'];
            const query = {
                ...request,
                categories: request.categories.length ? [...request.categories] : undefined,
                currencies: request.currencies.length ? [...request.currencies] : undefined,
                statuses: request.statuses.length ? [...request.statuses] : undefined,
            } as unknown as Query;
            return endpoint({ signal: abortSignalForAny([signal, requestSignal]) }, { query });
        },
        initiateRefund: ({ amount, refundReason, signal: requestSignal, transactionId }) => {
            const endpoint = configController.getSnapshot().contextValue.endpoints.initiateRefund;
            if (!endpoint) throw new Error('Initiate refund endpoint is unavailable');
            type Request = Parameters<EndpointHttpCallables<'initiateRefund'>>[0];
            return endpoint(
                {
                    body: { amount, refundReason } as Request['body'],
                    contentType: 'application/json',
                    signal: abortSignalForAny([signal, requestSignal]),
                },
                { path: { transactionId } }
            );
        },
        refresh: () => configController.getSnapshot().contextValue.refresh(),
        subscribe: listener =>
            configController.connect(() => {
                const snapshot = getSnapshot();
                if (wasRefreshing && !snapshot.refreshing) reloadBalanceAccounts();
                wasRefreshing = snapshot.refreshing;
                listener(snapshot);
            }),
    };
};

export const createTransactionsDependencies = async (
    core: CoreInstance,
    componentType: ExternalComponentType,
    signal: AbortSignal
): Promise<Readonly<{ dependencies: TransactionsDependencies; dispose(): void }>> => {
    const configController = createConfigController(core.session, componentType);
    const [translationBinding] = await Promise.all([
        createDomainTranslations<TransactionsTranslationKey, TransactionsTranslationLocale>({
            core,
            domain: 'transactions',
            loaders: TRANSACTIONS_TRANSLATION_LOADERS,
            protectedKeys: TRANSACTIONS_PROTECTED_TRANSLATION_KEYS,
            signal,
            source: TRANSACTIONS_EN_US,
        }),
    ]);
    const balanceAccounts = createBalanceAccounts(configController, signal);
    const analytics = setupConfigAnalytics(core.analyticsEnabled, configController, componentType);

    return {
        dependencies: {
            balanceAccounts,
            callbacks: createTransactionsCallbacks(analytics.events),
            runtime: createTransactionsRuntime(configController, signal, balanceAccounts.reload),
            translations: translationBinding.translations,
        },
        dispose: () => {
            analytics.dispose();
            translationBinding.dispose();
        },
    };
};
