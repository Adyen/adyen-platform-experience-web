import { createBalanceAccounts, createConfigController } from '@integration-components/core';
import { createDomainTranslations, type CoreInstance } from '@integration-components/core/vue';
import { bindDomainComponent, type DomainComponentHandle } from '@integration-components/domain-integration';
import {
    PAYOUTS_EN_US,
    PAYOUTS_PROTECTED_TRANSLATION_KEYS,
    PAYOUTS_TRANSLATION_LOADERS,
    type PayoutsTranslationKey,
    type PayoutsTranslationLocale,
} from '@integration-components/payouts/domain';
import {
    PayoutDetailsDefinition,
    PayoutsOverviewDefinition,
    type PayoutDetailsDomainProps,
    type PayoutsDependencies,
    type PayoutsRuntime,
    type PayoutsRuntimeSnapshot,
} from '@integration-components/payouts/vue/definitions';
import { abortSignalForAny } from '@integration-components/utils';

const createPayoutsRuntime = (
    configController: ReturnType<typeof createConfigController>,
    signal: AbortSignal,
    reloadBalanceAccounts: () => void
): PayoutsRuntime => {
    let wasRefreshing = configController.getSnapshot().contextValue.refreshing;

    return {
        getPayout: ({ signal: requestSignal, ...query }) => {
            const endpoint = configController.getSnapshot().contextValue.endpoints.getPayout;
            if (!endpoint) throw new Error('Payout details endpoint is unavailable');
            return endpoint({ signal: abortSignalForAny([signal, requestSignal]) }, { query });
        },
        getPayouts: ({ signal: requestSignal, ...query }) => {
            const endpoint = configController.getSnapshot().contextValue.endpoints.getPayouts;
            if (!endpoint) throw new Error('Payouts endpoint is unavailable');
            return endpoint({ signal: abortSignalForAny([signal, requestSignal]) }, { query });
        },
        getSnapshot: (): PayoutsRuntimeSnapshot => {
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

const createPayoutsBinding = async (core: CoreInstance, component: 'payoutDetails' | 'payouts', signal: AbortSignal) => {
    const configController = createConfigController(core.session, component);
    const translationBinding = await createDomainTranslations<PayoutsTranslationKey, PayoutsTranslationLocale>({
        core,
        domain: 'payouts',
        loaders: PAYOUTS_TRANSLATION_LOADERS,
        protectedKeys: PAYOUTS_PROTECTED_TRANSLATION_KEYS,
        signal,
        source: PAYOUTS_EN_US,
    });
    const balanceAccounts = createBalanceAccounts(configController, signal);
    const dependencies: PayoutsDependencies = {
        balanceAccounts,
        runtime: createPayoutsRuntime(configController, signal, balanceAccounts.reload),
        translations: translationBinding.translations,
    };
    return {
        dependencies,
        dispose: translationBinding.dispose,
    };
};

export const bindPayoutsOverview = (core: CoreInstance) =>
    bindDomainComponent(PayoutsOverviewDefinition, ({ signal }) => createPayoutsBinding(core, 'payouts', signal));

export const createPayoutDetailsHandle = async (
    core: CoreInstance,
    props: PayoutDetailsDomainProps
): Promise<DomainComponentHandle<Partial<PayoutDetailsDomainProps>, Element | string>> =>
    bindDomainComponent(PayoutDetailsDefinition, ({ signal }) => createPayoutsBinding(core, 'payoutDetails', signal)).create(props);
