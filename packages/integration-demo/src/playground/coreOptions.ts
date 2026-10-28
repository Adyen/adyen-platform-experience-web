import type { CoreOptions, CustomTheme, SupportedLocales, ThemeMode } from '@adyen/adyen-platform-experience-web';
import { getDefaultValues, optional, presetControl, toVisibility, visibilityControl, type Presets } from './controls';
import type { ControlSection, ControlValues } from './types';

const LOCALES: readonly SupportedLocales[] = ['da-DK', 'de-DE', 'en-US', 'es-ES', 'fi-FI', 'fr-FR', 'it-IT', 'nl-NL', 'no-NO', 'pt-BR', 'sv-SE'];

const CUSTOM_COLUMN_LABELS = {
    _action: 'Action',
    _country: 'Country',
    _product: 'Product',
    _store: 'Store',
    _summary: 'Summary',
};

const TEXT_OVERRIDES = {
    'payouts.details.title': 'Settlement details',
    'payouts.overview.title': 'Settlements',
    'reports.overview.title': 'Downloads',
    'transactions.details.title': 'Sale details',
    'transactions.overview.title': 'Sales activity',
};

const columnLabelTranslations = Object.fromEntries(LOCALES.map(locale => [locale, CUSTOM_COLUMN_LABELS]));

const TRANSLATION_PRESETS: Presets<CoreOptions['translations']> = {
    '': { label: 'None' },
    columnLabels: { label: 'Custom column labels', value: columnLabelTranslations },
    overrides: {
        label: 'Column labels + en-US title overrides',
        value: { ...columnLabelTranslations, 'en-US': { ...CUSTOM_COLUMN_LABELS, ...TEXT_OVERRIDES } },
    },
};

const THEME_PRESETS: Presets<CustomTheme> = {
    '': { label: 'None' },
    brand: {
        label: 'Purple, large roundness',
        value: { light: { primary: '#3D14BF', roundness: 'large' }, dark: { primary: '#EDE8FF', roundness: 'large' } },
    },
    teal: {
        label: 'Teal, small roundness',
        value: { light: { primary: '#00483D', roundness: 'small' }, dark: { primary: '#B5F3E7', roundness: 'small' } },
    },
    rose: {
        label: 'Rose, all properties',
        value: {
            light: { primary: '#7A1038', outline: '#E5C8C1', neutral: '#7A6460', background: '#FFF8F5', label: '#2B1A17', roundness: 'medium' },
            dark: { primary: '#FFEAF0', outline: '#5A3D43', neutral: '#B39A9E', background: '#1C1214', label: '#FFF1F3', roundness: 'medium' },
        },
    },
};

export const GLOBAL_SECTIONS: readonly ControlSection[] = [
    {
        title: 'core',
        controls: [
            {
                key: 'locale',
                label: 'locale',
                type: 'select',
                defaultValue: 'en-US',
                options: LOCALES.map(locale => ({ label: locale, value: locale })),
            },
            {
                key: 'themeMode',
                label: 'themeMode',
                type: 'radio',
                defaultValue: 'light',
                options: [
                    { label: 'Light', value: 'light' },
                    { label: 'Dark', value: 'dark' },
                ],
            },
            presetControl('customTheme', 'customTheme', THEME_PRESETS),
            {
                ...presetControl('translations', 'translations', TRANSLATION_PRESETS),
                defaultValue: 'columnLabels',
                hint: 'Custom columns from dataCustomization take their header labels from translations.',
            },
        ],
    },
    {
        title: 'core.appearance',
        controls: [visibilityControl('container', 'Default'), visibilityControl('illustrations', 'Default'), visibilityControl('titles', 'Default')],
    },
];

export const toCoreOptions = (values: ControlValues) =>
    ({
        locale: values.locale as SupportedLocales,
        themeMode: optional<ThemeMode>(values.themeMode),
        customTheme: THEME_PRESETS[values.customTheme]?.value,
        translations: TRANSLATION_PRESETS[values.translations]?.value,
        appearance: toVisibility(values),
    }) satisfies Partial<CoreOptions>;

export const INITIAL_CORE_OPTIONS = toCoreOptions(getDefaultValues(GLOBAL_SECTIONS));

console.log('INITIAL_CORE_OPTIONS', INITIAL_CORE_OPTIONS);
