import type { TranslationKey } from '@integration-components/core';
import type { IPaymentLinkTermsAndConditions } from '@integration-components/types';

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
