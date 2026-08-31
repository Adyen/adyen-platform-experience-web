import { createDomainVuePlugin, type DisposableVuePlugin } from '@integration-components/composables-vue/createDomainVuePlugin';
import { REPORTS_CONTEXT } from './context';
import type { ReportsOverviewDependencies } from './types';

export const createReportsVuePlugin = (dependencies: ReportsOverviewDependencies): DisposableVuePlugin =>
    createDomainVuePlugin({
        balanceAccounts: dependencies.balanceAccounts,
        contextKey: REPORTS_CONTEXT,
        createContext: ({ balanceAccounts, runtime }) => ({
            balanceAccounts,
            i18n: dependencies.translations.i18n,
            provideTranslationOverrides: dependencies.translations.provideOverrides,
            runtime,
        }),
        createRuntime: snapshot => ({
            ...snapshot,
            downloadReport: dependencies.runtime.downloadReport.bind(dependencies.runtime),
            getReports: dependencies.runtime.getReports.bind(dependencies.runtime),
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
