import { TranslationKey } from '../../../../../../../translations';

export const ActiveMenuItem = {
    theme: 'theme',
    termsAndConditions: 'termsAndConditions',
};

export const MENU_ITEMS = [
    { value: ActiveMenuItem.theme, label: 'payByLink.settings.navigation.theme' },
    { value: ActiveMenuItem.termsAndConditions, label: 'payByLink.settings.navigation.termsAndConditions' },
] as { value: string; label: TranslationKey }[];

export const DEFAULT_MENU_ITEM = ActiveMenuItem.theme;
