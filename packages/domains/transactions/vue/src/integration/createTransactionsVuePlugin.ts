import { createDomainVuePlugin, type DisposableVuePlugin } from '@integration-components/composables-vue/createDomainVuePlugin';
import { TRANSACTIONS_CONTEXT } from './context';
import type { TransactionsDependencies } from './types';

export const createTransactionsVuePlugin = (dependencies: TransactionsDependencies): DisposableVuePlugin =>
    createDomainVuePlugin({
        balanceAccounts: dependencies.balanceAccounts,
        contextKey: TRANSACTIONS_CONTEXT,
        createContext: ({ balanceAccounts, runtime }) => ({
            balanceAccounts,
            i18n: dependencies.translations.i18n,
            provideTranslationOverrides: dependencies.translations.provideOverrides,
            runtime,
        }),
        createRuntime: snapshot => ({
            ...snapshot,
            downloadTransactions: dependencies.runtime.downloadTransactions.bind(dependencies.runtime),
            getBalances: dependencies.runtime.getBalances.bind(dependencies.runtime),
            getTransaction: dependencies.runtime.getTransaction.bind(dependencies.runtime),
            getTransactions: dependencies.runtime.getTransactions.bind(dependencies.runtime),
            getTransactionsTotals: dependencies.runtime.getTransactionsTotals.bind(dependencies.runtime),
            initiateRefund: dependencies.runtime.initiateRefund.bind(dependencies.runtime),
            refresh: dependencies.runtime.refresh.bind(dependencies.runtime),
        }),
        runtime: dependencies.runtime,
        syncBalanceAccounts: (current, next) => {
            Object.assign(current, { accounts: next.accounts, error: next.error, loading: next.loading });
        },
        syncRuntime: (current, next) => {
            Object.assign(current, { ...next, available: next.available });
        },
        translations: dependencies.translations,
    });
