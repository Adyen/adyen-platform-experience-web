import { createDomainVuePlugin, type DisposableVuePlugin } from '@integration-components/composables-vue/createDomainVuePlugin';
import { PAYOUTS_CONTEXT } from './context';
import type { PayoutsDependencies } from './types';

export const createPayoutsVuePlugin = (dependencies: PayoutsDependencies): DisposableVuePlugin =>
    createDomainVuePlugin({
        balanceAccounts: dependencies.balanceAccounts,
        contextKey: PAYOUTS_CONTEXT,
        createContext: ({ balanceAccounts, runtime }) => ({
            balanceAccounts,
            i18n: dependencies.translations.i18n,
            provideTranslationOverrides: dependencies.translations.provideOverrides,
            runtime,
        }),
        createRuntime: snapshot => ({
            ...snapshot,
            getPayout: dependencies.runtime.getPayout.bind(dependencies.runtime),
            getPayouts: dependencies.runtime.getPayouts.bind(dependencies.runtime),
            refresh: dependencies.runtime.refresh.bind(dependencies.runtime),
        }),
        runtime: dependencies.runtime,
        syncBalanceAccounts: (current, next) => {
            Object.assign(current, { accounts: next.accounts, error: next.error, loading: next.loading });
        },
        syncRuntime: (current, next) => {
            Object.assign(current, { available: next.available, refreshing: next.refreshing });
        },
        translations: dependencies.translations,
    });
