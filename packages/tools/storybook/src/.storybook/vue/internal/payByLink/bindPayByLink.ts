import { createConfigController } from '@integration-components/core';
import { createDomainTranslations, type CoreInstance } from '@integration-components/core/vue';
import { bindDomainComponent, type DomainComponentHandle } from '@integration-components/domain-integration';
import {
    PAY_BY_LINK_EN_US,
    PAY_BY_LINK_PROTECTED_TRANSLATION_KEYS,
    PAY_BY_LINK_TRANSLATION_LOADERS,
    type PayByLinkTranslationKey,
    type PayByLinkTranslationLocale,
} from '@integration-components/payByLink/domain';
import {
    PaymentLinkCreationDefinition,
    PaymentLinkDetailsDefinition,
    PaymentLinkSettingsDefinition,
    PaymentLinksOverviewDefinition,
    type PayByLinkDependencies,
    type PaymentLinkCreationDomainProps,
    type PaymentLinkDetailsDomainProps,
    type PaymentLinkSettingsDomainProps,
} from '@integration-components/payByLink/vue/definitions';

const createPayByLinkBinding = async (
    core: CoreInstance,
    component: 'paymentLinkCreation' | 'paymentLinkDetails' | 'paymentLinkSettings' | 'paymentLinksOverview',
    signal: AbortSignal
) => {
    const configController = createConfigController(core.session, component);
    const getSnapshot = () => {
        const snapshot = configController.getSnapshot();
        return {
            available: snapshot.hasPermission,
            endpoints: snapshot.contextValue.endpoints,
            refreshing: snapshot.contextValue.refreshing,
        };
    };
    const translationBinding = await createDomainTranslations<PayByLinkTranslationKey, PayByLinkTranslationLocale>({
        core,
        domain: 'payByLink',
        loaders: PAY_BY_LINK_TRANSLATION_LOADERS,
        protectedKeys: PAY_BY_LINK_PROTECTED_TRANSLATION_KEYS,
        signal,
        source: PAY_BY_LINK_EN_US,
    });
    const dependencies: PayByLinkDependencies = {
        runtime: {
            getCdnConfig: options => core.getCdnConfig(options),
            getCdnDataset: options => core.getCdnDataset(options),
            getSnapshot,
            refresh: () => configController.getSnapshot().contextValue.refresh(),
            subscribe: listener => configController.connect(() => listener(getSnapshot())),
        },
        translations: translationBinding.translations,
    };

    return { dependencies, dispose: translationBinding.dispose };
};

export const bindPaymentLinksOverview = (core: CoreInstance) =>
    bindDomainComponent(PaymentLinksOverviewDefinition, ({ signal }) => createPayByLinkBinding(core, 'paymentLinksOverview', signal));

export const createPaymentLinkCreationHandle = (
    core: CoreInstance,
    props: PaymentLinkCreationDomainProps
): Promise<DomainComponentHandle<Partial<PaymentLinkCreationDomainProps>, Element | string>> =>
    bindDomainComponent(PaymentLinkCreationDefinition, ({ signal }) => createPayByLinkBinding(core, 'paymentLinkCreation', signal)).create(props);

export const createPaymentLinkDetailsHandle = (
    core: CoreInstance,
    props: PaymentLinkDetailsDomainProps
): Promise<DomainComponentHandle<Partial<PaymentLinkDetailsDomainProps>, Element | string>> =>
    bindDomainComponent(PaymentLinkDetailsDefinition, ({ signal }) => createPayByLinkBinding(core, 'paymentLinkDetails', signal)).create(props);

export const createPaymentLinkSettingsHandle = (
    core: CoreInstance,
    props: PaymentLinkSettingsDomainProps
): Promise<DomainComponentHandle<Partial<PaymentLinkSettingsDomainProps>, Element | string>> =>
    bindDomainComponent(PaymentLinkSettingsDefinition, ({ signal }) => createPayByLinkBinding(core, 'paymentLinkSettings', signal)).create(props);
