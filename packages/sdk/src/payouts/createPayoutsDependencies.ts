import { createBalanceAccounts, createConfigController } from '@integration-components/core';
import type { CoreInstance } from '@integration-components/core/vue';
import { createDomainTranslations } from '@integration-components/core/vue';
import {
    PAYOUTS_EN_US,
    PAYOUTS_PROTECTED_TRANSLATION_KEYS,
    PAYOUTS_TRANSLATION_LOADERS,
    type PayoutsTranslationKey,
    type PayoutsTranslationLocale,
} from '@integration-components/payouts/domain';
import type { PayoutsDependencies, PayoutsRuntime, PayoutsRuntimeSnapshot } from '@integration-components/payouts/vue/definitions';
import type { ExternalComponentType } from '@integration-components/types';
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

export const createPayoutsDependencies = async (
    core: CoreInstance,
    componentType: ExternalComponentType,
    signal: AbortSignal
): Promise<Readonly<{ dependencies: PayoutsDependencies; dispose(): void }>> => {
    const configController = createConfigController(core.session, componentType);
    const translationBinding = await createDomainTranslations<PayoutsTranslationKey, PayoutsTranslationLocale>({
        core,
        domain: 'payouts',
        loaders: PAYOUTS_TRANSLATION_LOADERS,
        protectedKeys: PAYOUTS_PROTECTED_TRANSLATION_KEYS,
        signal,
        source: PAYOUTS_EN_US,
    });
    const balanceAccounts = createBalanceAccounts(configController, signal);

    return {
        dependencies: {
            balanceAccounts,
            runtime: createPayoutsRuntime(configController, signal, balanceAccounts.reload),
            translations: translationBinding.translations,
        },
        dispose: translationBinding.dispose,
    };
};
