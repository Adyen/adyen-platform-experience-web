import type { CoreInstance } from '@integration-components/core/vue';
import type { AdyenPlatformExperienceError, TranslationKey } from '@integration-components/core';
import type { IPaymentLinkTermsAndConditions } from '@integration-components/types';
import type { StoreIds } from '@integration-components/payByLink/domain';

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

export type PaymentLinkSettingsItem = 'theme' | 'termsAndConditions';
export type PaymentLinkSettingsMenuItem = { value: PaymentLinkSettingsItem; label: TranslationKey };
export type MenuItemType = { value: PaymentLinkSettingsItem; label: string };

export type ThemeFormData = {
    logo?: string | undefined;
    fullWidthLogo?: string | undefined;
    brandName?: string | undefined;
};

export type PaymentLinkSettingsData = IPaymentLinkTermsAndConditions | ThemeFormData | undefined;
export type PaymentLinkSettingsPayload = FormData | IPaymentLinkTermsAndConditions | undefined;

export type StoreItem = {
    id: string;
    name: string;
    storeCode: string;
    description: string;
};

export type LogoType = 'logo' | 'fullWidthLogo';

export type SettingsErrorContent = {
    title: TranslationKey;
    messages: TranslationKey[];
    refreshComponent: boolean;
};

export type SettingsError = AdyenPlatformExperienceError | undefined;
