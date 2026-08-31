import { createConfigController } from '@integration-components/core';
import {
    V2_ROUTED_BENTO_TRANSLATION_KEYS,
    type DomainTranslationInputs,
    type V2BentoTranslationKey,
} from '@integration-components/core/translation-contract';
import { createDomainTranslationVueBinding } from '@integration-components/core/vue/translationBinding';
import type { CoreInstance } from '@integration-components/core/vue';
import { bindDomainComponent } from '@integration-components/domain-integration';
import { abortSignalForAny } from '@integration-components/utils';
import {
    REPORTS_EN_US,
    REPORTS_PROTECTED_TRANSLATION_KEYS,
    REPORTS_TRANSLATION_LOADERS,
    type ReportsTranslationKey,
    type ReportsTranslationLocale,
    type ReportsTranslationSource,
} from '@integration-components/reports/domain';
import {
    ReportsOverviewDefinition,
    type ReportsBalanceAccounts,
    type ReportsBalanceAccountsSnapshot,
    type ReportsOverviewDependencies,
    type ReportsOverviewRuntime,
    type ReportsOverviewRuntimeSnapshot,
    type ReportsOverviewTranslations,
} from '@integration-components/reports/vue/definitions';

type ReportsDomainTranslationKey = ReportsTranslationKey | V2BentoTranslationKey;

interface ReportsBalanceAccountsController extends ReportsBalanceAccounts {
    reload(): void;
}

const createReportsBalanceAccounts = (
    configController: ReturnType<typeof createConfigController>,
    signal: AbortSignal
): ReportsBalanceAccountsController => {
    const listeners = new Set<(snapshot: ReportsBalanceAccountsSnapshot) => void>();
    let snapshot: ReportsBalanceAccountsSnapshot = { accounts: undefined, error: undefined, loading: true };
    let loadController: AbortController | undefined;
    let loadVersion = 0;

    const publish = (nextSnapshot: ReportsBalanceAccountsSnapshot) => {
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
            if (version === loadVersion && !signal.aborted) publish({ accounts: snapshot.accounts, error: error as Error, loading: false });
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

const createReportsRuntime = (
    core: CoreInstance,
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

const loadReportsTranslationSource = (locale: string | undefined): Promise<ReportsTranslationSource | undefined> => {
    if (!locale || !Object.hasOwn(REPORTS_TRANSLATION_LOADERS, locale)) return Promise.resolve(undefined);
    return REPORTS_TRANSLATION_LOADERS[locale as ReportsTranslationLocale]();
};

const createReportsTranslations = async (
    core: CoreInstance,
    signal: AbortSignal
): Promise<Readonly<{ dispose(): void; translations: ReportsOverviewTranslations }>> => {
    const connection = core.connectDomainTranslations<ReportsDomainTranslationKey>('reports', signal);
    const inputs = connection.translations.getInputs();
    const localSources: Record<string, ReportsTranslationSource> = {};
    const initialSource = await loadReportsTranslationSource(inputs.locale).catch(() => undefined);
    if (signal.aborted) {
        connection.dispose();
        throw signal.reason;
    }
    if (inputs.locale && initialSource) localSources[inputs.locale] = initialSource;
    const binding = createDomainTranslationVueBinding({
        formatters: {
            amount: (amount, currencyCode, options) => core.i18n.amount(amount, currencyCode, options),
            date: (date, options) => core.i18n.date(date, options),
            fullDate: date => core.i18n.fullDate(date),
            ready: core.i18n.ready,
            timezone: core.i18n.timezone,
        },
        inputs,
        localSources,
        protectedKeys: REPORTS_PROTECTED_TRANSLATION_KEYS,
        source: REPORTS_EN_US,
        universalKeys: V2_ROUTED_BENTO_TRANSLATION_KEYS,
    });
    let syncVersion = 0;
    const sync = async (nextInputs: DomainTranslationInputs<ReportsDomainTranslationKey>) => {
        const version = ++syncVersion;
        const source = await loadReportsTranslationSource(nextInputs.locale).catch(() => undefined);
        if (version !== syncVersion || signal.aborted) return;
        if (nextInputs.locale && source) localSources[nextInputs.locale] = source;
        binding.sync(nextInputs);
    };
    const unsubscribe = connection.translations.subscribe(nextInputs => void sync(nextInputs));

    return {
        dispose: () => {
            syncVersion++;
            unsubscribe();
            connection.dispose();
        },
        translations: {
            configure: app => {
                app.use(binding.vueI18n);
            },
            i18n: binding.i18n,
            provideOverrides: () => binding.provideBentoOverrides(),
        },
    };
};

export const bindReportsOverview = (core: CoreInstance) =>
    bindDomainComponent(ReportsOverviewDefinition, async ({ signal }) => {
        const configController = createConfigController(core.session, 'reports');
        const translationBinding = await createReportsTranslations(core, signal);
        const balanceAccounts = createReportsBalanceAccounts(configController, signal);

        const dependencies: ReportsOverviewDependencies = {
            balanceAccounts,
            runtime: createReportsRuntime(core, configController, signal, balanceAccounts.reload),
            translations: translationBinding.translations,
        };

        return {
            dependencies,
            dispose: translationBinding.dispose,
        };
    });
