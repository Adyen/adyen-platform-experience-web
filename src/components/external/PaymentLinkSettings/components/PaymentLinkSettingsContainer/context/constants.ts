import { PaymentLinkSettingsItem, PaymentLinkSettingsMenuItem } from './types';

export const MenuItem = {
    theme: 'theme',
    termsAndConditions: 'termsAndConditions',
} as const;

export const MENU_ITEMS = [
    { value: MenuItem.theme, label: 'payByLink.settings.navigation.theme' },
    { value: MenuItem.termsAndConditions, label: 'payByLink.settings.navigation.termsAndConditions' },
] as PaymentLinkSettingsMenuItem[];

export const DEFAULT_MENU_ITEM = MenuItem.theme as PaymentLinkSettingsItem;
