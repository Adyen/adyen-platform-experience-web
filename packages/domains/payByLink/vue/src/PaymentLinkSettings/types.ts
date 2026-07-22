import type { CoreInstance } from '@integration-components/core/vue';
import type { AdyenPlatformExperienceError, TranslationKey } from '@integration-components/core';
import type { PaymentLinkSettingsItem, StoreIds } from '@integration-components/payByLink/domain';

export type {
    LogoType,
    MenuItemType,
    PaymentLinkSettingsData,
    PaymentLinkSettingsItem,
    PaymentLinkSettingsMenuItem,
    PaymentLinkSettingsPayload,
    ThemeFormData,
} from '@integration-components/payByLink/domain';

export interface PaymentLinkSettingsProps {
    hideTitle?: boolean;
    onContactSupport?: () => void;
    storeIds?: StoreIds;
    settingsItems?: PaymentLinkSettingsItem[];
    embeddedInOverview?: boolean;
    navigateBack?: () => void;
}

export interface PaymentLinkSettingsExternalProps extends PaymentLinkSettingsProps {
    core: CoreInstance;
}

export type StoreItem = {
    id: string;
    name: string;
    storeCode: string;
    description: string;
};

export type SettingsErrorContent = {
    title: TranslationKey;
    messages: TranslationKey[];
    refreshComponent: boolean;
};

export type SettingsError = AdyenPlatformExperienceError | undefined;
