import { createBalanceAccounts, createConfigController } from '@integration-components/core';
import type { CoreInstance } from '@integration-components/core/vue';
import { createDomainTranslations } from '@integration-components/core/vue/createDomainTranslations';
import { bindDomainComponent } from '@integration-components/domain-integration';
import {
    REPORTS_EN_US,
    REPORTS_PROTECTED_TRANSLATION_KEYS,
    REPORTS_TRANSLATION_LOADERS,
    type ReportsTranslationKey,
    type ReportsTranslationLocale,
} from '@integration-components/reports/domain';
import {
    ReportsOverviewDefinition,
    type ReportsOverviewDependencies,
    type ReportsOverviewRuntime,
    type ReportsOverviewRuntimeSnapshot,
} from '@integration-components/reports/vue/definitions';
import { abortSignalForAny } from '@integration-components/utils';

const createReportsRuntime = (
    configController: ReturnType<typeof createConfigController>,
    signal: AbortSignal,
    reloadBalanceAccounts: () => void
): ReportsOverviewRuntime => {
    let wasRefreshing = configController.getSnapshot().contextValue.refreshing;

    return {
        downloadReport: async ({ balanceAccountId, createdAt, type }) => {
            const endpoint = configController.getSnapshot().contextValue.endpoints.downloadReport;
            if (!endpoint) throw new Error('Reports download endpoint is unavailable');
            return endpoint({ signal }, { query: { balanceAccountId, createdAt, type } });
        },
        getReports: ({ signal: requestSignal, ...query }) => {
            const endpoint = configController.getSnapshot().contextValue.endpoints.getReports;
            if (!endpoint) throw new Error('Reports endpoint is unavailable');
            return endpoint({ errorLevel: 'error', signal: abortSignalForAny([signal, requestSignal]) }, { query: { ...query, type: 'payout' } });
        },
        getSnapshot: (): ReportsOverviewRuntimeSnapshot => {
            const snapshot = configController.getSnapshot();
            return {
                available: snapshot.hasPermission,
                refreshing: snapshot.contextValue.refreshing,
            };
        },
        refresh: () => configController.getSnapshot().contextValue.refresh(),
        subscribe: listener =>
            configController.connect(() => {
                const snapshot = configController.getSnapshot();
                const refreshing = snapshot.contextValue.refreshing;
                if (wasRefreshing && !refreshing) reloadBalanceAccounts();
                wasRefreshing = refreshing;
                listener({
                    available: snapshot.hasPermission,
                    refreshing,
                });
            }),
    };
};

export const bindReportsOverview = (core: CoreInstance) =>
    bindDomainComponent(ReportsOverviewDefinition, async ({ signal }) => {
        const configController = createConfigController(core.session, 'reports');
        const translationBinding = await createDomainTranslations<ReportsTranslationKey, ReportsTranslationLocale>({
            core,
            domain: 'reports',
            loaders: REPORTS_TRANSLATION_LOADERS,
            protectedKeys: REPORTS_PROTECTED_TRANSLATION_KEYS,
            signal,
            source: REPORTS_EN_US,
        });
        const balanceAccounts = createBalanceAccounts(configController, signal);

        const dependencies: ReportsOverviewDependencies = {
            balanceAccounts,
            runtime: createReportsRuntime(configController, signal, balanceAccounts.reload),
            translations: translationBinding.translations,
        };

        return {
            dependencies,
            dispose: translationBinding.dispose,
        };
    });
