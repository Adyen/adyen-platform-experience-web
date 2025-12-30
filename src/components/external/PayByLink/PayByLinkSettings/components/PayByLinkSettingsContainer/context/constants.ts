import { PayByLinkSettingsItem, PayByLinkSettingsMenuItem } from './types';

export const MenuItem = {
    theme: 'theme',
    termsAndConditions: 'termsAndConditions',
} as const;

export const MENU_ITEMS = [
    { value: MenuItem.theme, label: 'payByLink.settings.navigation.theme' },
    { value: MenuItem.termsAndConditions, label: 'payByLink.settings.navigation.termsAndConditions' },
] as PayByLinkSettingsMenuItem[];

export const DEFAULT_MENU_ITEM = MenuItem.theme as PayByLinkSettingsItem;
