import { createConfigController } from '@integration-components/core';
import { createDomainTranslations, type CoreInstance } from '@integration-components/core/vue';
import {
    PAY_BY_LINK_EN_US,
    PAY_BY_LINK_PROTECTED_TRANSLATION_KEYS,
    PAY_BY_LINK_TRANSLATION_LOADERS,
    type PayByLinkTranslationKey,
    type PayByLinkTranslationLocale,
} from '@integration-components/payByLink/domain';
import type { PayByLinkDependencies } from '@integration-components/payByLink/vue/definitions';
import type { ExternalComponentType } from '@integration-components/types';

export const createPayByLinkDependencies = async (
    core: CoreInstance,
    componentType: ExternalComponentType,
    signal: AbortSignal
): Promise<Readonly<{ dependencies: PayByLinkDependencies; dispose(): void }>> => {
    const configController = createConfigController(core.session, componentType);
    const getSnapshot = () => {
        const snapshot = configController.getSnapshot();
        return {
            available: snapshot.hasPermission,
            endpoints: snapshot.contextValue.endpoints,
            refreshing: snapshot.contextValue.refreshing,
        };
    };
    const translations = await createDomainTranslations<PayByLinkTranslationKey, PayByLinkTranslationLocale>({
        core,
        domain: 'payByLink',
        loaders: PAY_BY_LINK_TRANSLATION_LOADERS,
        protectedKeys: PAY_BY_LINK_PROTECTED_TRANSLATION_KEYS,
        signal,
        source: PAY_BY_LINK_EN_US,
    });

    return {
        dependencies: {
            runtime: {
                getCdnConfig: options => core.getCdnConfig(options),
                getCdnDataset: options => core.getCdnDataset(options),
                getSnapshot,
                refresh: () => configController.getSnapshot().contextValue.refresh(),
                subscribe: listener => configController.connect(() => listener(getSnapshot())),
            },
            translations: translations.translations,
        },
        dispose: translations.dispose,
    };
};
