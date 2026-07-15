import type { LogoType, PaymentLinkSettingsItem, PaymentLinkSettingsMenuItem } from './types';
import type { TranslationKey } from '@integration-components/core';

export const BASE_CLASS_NAME = 'adyen-pe-payment-link-settings';
export const CONTAINER_CLASS_NAME = `${BASE_CLASS_NAME}__content`;
export const CONTENT_CONTAINER_CLASS_NAME = `${BASE_CLASS_NAME}__content-container`;
export const CONTENT_CONTAINER_MOBILE_CLASS_NAME = `${BASE_CLASS_NAME}__content-container--mobile`;
export const SIDEBAR_CONTAINER_CLASS_NAME = `${BASE_CLASS_NAME}__sidebar-container`;
export const SECONDARY_NAV_CLASS_NAME = `${BASE_CLASS_NAME}__secondary-nav`;

export const MenuItem = {
    theme: 'theme',
    termsAndConditions: 'termsAndConditions',
} as const;

export const MENU_ITEMS = [
    { value: MenuItem.theme, label: 'payByLink.settings.navigation.theme' },
    { value: MenuItem.termsAndConditions, label: 'payByLink.settings.navigation.termsAndConditions' },
] as PaymentLinkSettingsMenuItem[];

export const DEFAULT_MENU_ITEM = MenuItem.theme as PaymentLinkSettingsItem;

export const THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE = 51200; // 50KB
export const THEME_FORM_ALLOWED_FILE_TYPES = ['image/jpeg'] as const;

export const logoOptions: Record<string, LogoType> = {
    LOGO: 'logo',
    FULL_WIDTH_LOGO: 'fullWidthLogo',
};

export const logoOptionsList: LogoType[] = ['logo', 'fullWidthLogo'];

export const LogoLabel = {
    logo: 'payByLink.settings.theme.logo.input.label',
    fullWidthLogo: 'payByLink.settings.theme.wideLogo.input.label',
} as Record<LogoType, TranslationKey>;

export const ThemeFormDataRequest = {
    BRAND: 'brandName',
    LOGO: 'logo',
    FULL_WIDTH_LOGO: 'fullWidthLogo',
};

export const LOGO_DIMENSIONS: Record<LogoType, { width: number; height: number }> = {
    logo: { width: 200, height: 200 },
    fullWidthLogo: { width: 300, height: 30 },
};

export const LOGO_DIMENSION_ERROR: Record<LogoType, TranslationKey> = {
    logo: 'payByLink.settings.themes.inputs.file.errors.logo.invalidDimensions',
    fullWidthLogo: 'payByLink.settings.themes.inputs.file.errors.fullWidthLogo.invalidDimensions',
};

export const ACCOUNT_MISCONFIGURATION = 'ACCOUNT_MISCONFIGURATION';
export const WRONG_STORE_IDS = 'WRONG_STORE_IDS';
export const PERMISSION_ERROR = 'PERMISSION_ERROR';
