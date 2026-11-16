import bentoEnUS from '../translations/bento/en-US.json' with { type: 'json' };
import type { LocalizationSources } from '@integration-components/core/Localization/Localization';
import type { TranslationDomain } from '@integration-components/core/translations';

export type BentoMirrorTranslationKey = keyof typeof bentoEnUS;
export const BENTO_TRANSLATION_KEYS = Object.keys(bentoEnUS) as BentoMirrorTranslationKey[];
export const SDK_BENTO_DEFAULT_TRANSLATIONS = bentoEnUS;

export const SDK_TRANSLATION_SOURCES: LocalizationSources = {
    defaultTranslations: {},
    domainDefaultTranslations: {
        capital: () => import('../../domains/capital/vue/translations/en-US.json').then(({ default: translations }) => translations),
        disputes: () => import('../../domains/disputes/vue/translations/en-US.json').then(({ default: translations }) => translations),
        payByLink: () => import('../../domains/payByLink/vue/translations/en-US.json').then(({ default: translations }) => translations),
        payouts: () => import('../../domains/payouts/vue/translations/en-US.json').then(({ default: translations }) => translations),
        reports: () => import('../../domains/reports/vue/translations/en-US.json').then(({ default: translations }) => translations),
        transactions: () => import('../../domains/transactions/vue/translations/en-US.json').then(({ default: translations }) => translations),
    } satisfies Record<TranslationDomain, () => Promise<Record<string, string>>>,
    localeTranslations: {
        'da-DK': () => import('../translations/da-DK.json').then(({ default: translations }) => translations),
        'de-DE': () => import('../translations/de-DE.json').then(({ default: translations }) => translations),
        'en-US': Promise.resolve({}),
        'es-ES': () => import('../translations/es-ES.json').then(({ default: translations }) => translations),
        'fi-FI': () => import('../translations/fi-FI.json').then(({ default: translations }) => translations),
        'fr-FR': () => import('../translations/fr-FR.json').then(({ default: translations }) => translations),
        'it-IT': () => import('../translations/it-IT.json').then(({ default: translations }) => translations),
        'nl-NL': () => import('../translations/nl-NL.json').then(({ default: translations }) => translations),
        'no-NO': () => import('../translations/no-NO.json').then(({ default: translations }) => translations),
        'pt-BR': () => import('../translations/pt-BR.json').then(({ default: translations }) => translations),
        'sv-SE': () => import('../translations/sv-SE.json').then(({ default: translations }) => translations),
    },
};

export const SDK_BENTO_TRANSLATION_SOURCES: LocalizationSources = {
    defaultTranslations: SDK_BENTO_DEFAULT_TRANSLATIONS,
    localeTranslations: {
        'da-DK': () => import('../translations/bento/da-DK.json').then(({ default: translations }) => translations),
        'de-DE': () => import('../translations/bento/de-DE.json').then(({ default: translations }) => translations),
        'en-US': Promise.resolve(bentoEnUS),
        'es-ES': () => import('../translations/bento/es-ES.json').then(({ default: translations }) => translations),
        'fi-FI': () => import('../translations/bento/fi-FI.json').then(({ default: translations }) => translations),
        'fr-FR': () => import('../translations/bento/fr-FR.json').then(({ default: translations }) => translations),
        'it-IT': () => import('../translations/bento/it-IT.json').then(({ default: translations }) => translations),
        'nl-NL': () => import('../translations/bento/nl-NL.json').then(({ default: translations }) => translations),
        'no-NO': () => import('../translations/bento/no-NO.json').then(({ default: translations }) => translations),
        'pt-BR': () => import('../translations/bento/pt-BR.json').then(({ default: translations }) => translations),
        'sv-SE': () => import('../translations/bento/sv-SE.json').then(({ default: translations }) => translations),
    },
};
