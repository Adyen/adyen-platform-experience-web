import { createDomainVuePlugin, type DisposableVuePlugin } from '@integration-components/composables-vue/createDomainVuePlugin';
import { DISPUTES_CONTEXT } from './context';
import type { DisputesDependencies } from './types';

export const createDisputesVuePlugin = (dependencies: DisputesDependencies): DisposableVuePlugin =>
    createDomainVuePlugin({
        balanceAccounts: dependencies.balanceAccounts,
        contextKey: DISPUTES_CONTEXT,
        createContext: ({ balanceAccounts, runtime }) => ({
            balanceAccounts,
            i18n: dependencies.translations.i18n,
            provideTranslationOverrides: dependencies.translations.provideOverrides,
            runtime,
        }),
        createRuntime: snapshot => ({
            ...snapshot,
            acceptDispute: dependencies.runtime.acceptDispute.bind(dependencies.runtime),
            defendDispute: dependencies.runtime.defendDispute.bind(dependencies.runtime),
            downloadDefenseDocument: dependencies.runtime.downloadDefenseDocument.bind(dependencies.runtime),
            getApplicableDefenseDocuments: dependencies.runtime.getApplicableDefenseDocuments.bind(dependencies.runtime),
            getDispute: dependencies.runtime.getDispute.bind(dependencies.runtime),
            getDisputes: dependencies.runtime.getDisputes.bind(dependencies.runtime),
            getDisputesConfig: dependencies.runtime.getDisputesConfig.bind(dependencies.runtime),
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
