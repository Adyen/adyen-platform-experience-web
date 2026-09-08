import enUS from '../translations/en-US.json' with { type: 'json' };
import type { LocalizationSources } from '@integration-components/core/Localization/Localization';

export const SDK_TRANSLATION_SOURCES: LocalizationSources = {
    defaultTranslations: enUS,
    localeTranslations: {
        'da-DK': () => import('../translations/da-DK.json').then(({ default: translations }) => translations),
        'de-DE': () => import('../translations/de-DE.json').then(({ default: translations }) => translations),
        'en-US': Promise.resolve(enUS),
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
