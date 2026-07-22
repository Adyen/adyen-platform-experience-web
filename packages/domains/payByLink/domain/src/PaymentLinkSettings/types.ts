import type { TranslationKey } from '@integration-components/core';
import type { IPaymentLinkTermsAndConditions, UIElementProps } from '@integration-components/types';
import type { StoreIds } from '../types';

export interface PaymentLinkSettingsProps extends UIElementProps {
    storeIds?: StoreIds;
    settingsItems?: PaymentLinkSettingsItem[];
    embeddedInOverview?: boolean;
    navigateBack?: () => void;
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
export type LogoType = 'logo' | 'fullWidthLogo';
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
