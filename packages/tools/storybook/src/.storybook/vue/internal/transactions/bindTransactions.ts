import { createBalanceAccounts, createConfigController, setupConfigAnalytics, type EndpointHttpCallables } from '@integration-components/core';
import { createDomainTranslations, type CoreInstance } from '@integration-components/core/vue';
import { bindDomainComponent, type DomainComponentHandle } from '@integration-components/domain-integration';
import { createTransactionsCallbacks } from '@integration-components/sdk/transactions';
import {
    TRANSACTIONS_EN_US,
    TRANSACTIONS_PROTECTED_TRANSLATION_KEYS,
    TRANSACTIONS_TRANSLATION_LOADERS,
    type TransactionsTranslationKey,
    type TransactionsTranslationLocale,
} from '@integration-components/transactions/domain';
import {
    TransactionDetailsDefinition,
    TransactionsOverviewDefinition,
    type TransactionDetailsDomainProps,
    type TransactionsDependencies,
    type TransactionsRuntime,
    type TransactionsRuntimeSnapshot,
} from '@integration-components/transactions/vue/definitions';
import { abortSignalForAny } from '@integration-components/utils';

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
            return endpoint(
                { signal: abortSignalForAny([signal, requestSignal]) },
                {
                    query: {
                        ...request,
                        categories: request.categories.length ? [...request.categories] : undefined,
                        currencies: request.currencies.length ? [...request.currencies] : undefined,
                        statuses: request.statuses.length ? [...request.statuses] : undefined,
                    } as unknown as Query,
                }
            );
        },
        getTransactionsTotals: ({ signal: requestSignal, ...request }) => {
            const endpoint = configController.getSnapshot().contextValue.endpoints.getTransactionTotals;
            if (!endpoint) throw new Error('Transaction totals endpoint is unavailable');
            type Query = Parameters<EndpointHttpCallables<'getTransactionTotals'>>[1]['query'];
            return endpoint(
                { signal: abortSignalForAny([signal, requestSignal]) },
                {
                    query: {
                        ...request,
                        categories: request.categories.length ? [...request.categories] : undefined,
                        currencies: request.currencies.length ? [...request.currencies] : undefined,
                        statuses: request.statuses.length ? [...request.statuses] : undefined,
                    } as unknown as Query,
                }
            );
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

const createTransactionsBinding = async (core: CoreInstance, component: 'transactionDetails' | 'transactions', signal: AbortSignal) => {
    const configController = createConfigController(core.session, component);
    const translationBinding = await createDomainTranslations<TransactionsTranslationKey, TransactionsTranslationLocale>({
        core,
        domain: 'transactions',
        loaders: TRANSACTIONS_TRANSLATION_LOADERS,
        protectedKeys: TRANSACTIONS_PROTECTED_TRANSLATION_KEYS,
        signal,
        source: TRANSACTIONS_EN_US,
    });
    const balanceAccounts = createBalanceAccounts(configController, signal);
    const analytics = setupConfigAnalytics(core.analyticsEnabled, configController, component);
    const dependencies: TransactionsDependencies = {
        balanceAccounts,
        callbacks: createTransactionsCallbacks(analytics.events),
        runtime: createTransactionsRuntime(configController, signal, balanceAccounts.reload),
        translations: translationBinding.translations,
    };

    return {
        dependencies,
        dispose: () => {
            analytics.dispose();
            translationBinding.dispose();
        },
    };
};

export const bindTransactionsOverview = (core: CoreInstance) =>
    bindDomainComponent(TransactionsOverviewDefinition, ({ signal }) => createTransactionsBinding(core, 'transactions', signal));

export const createTransactionDetailsHandle = (
    core: CoreInstance,
    props: TransactionDetailsDomainProps
): Promise<DomainComponentHandle<Partial<TransactionDetailsDomainProps>, Element | string>> =>
    bindDomainComponent(TransactionDetailsDefinition, ({ signal }) => createTransactionsBinding(core, 'transactionDetails', signal)).create(props);
