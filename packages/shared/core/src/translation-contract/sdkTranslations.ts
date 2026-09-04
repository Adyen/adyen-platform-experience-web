import enUs from '@integration-components/sdk-localization/translations/en-US.json' with { type: 'json' };
import bentoEnUs from '@integration-components/sdk-localization/translations/bento/en-US.json' with { type: 'json' };
import type { TranslationSource } from './types';

/**
 * SDK-owned public translation copy for the V2 translation contract.
 *
 * The values live in the `@integration-components/sdk-localization` package, authored from the
 * public catalog: every `common.*` key plus SDK-held copies of the `{domain}.*` public keys, one
 * file per locale, using flat canonical SDK keys only. Bento keys never appear here; they are
 * internal SDK routes resolved through the contract. Domain fallback copy stays domain-owned.
 */
export const V2_SDK_DEFAULT_TRANSLATIONS = enUs as TranslationSource;

const localeLoaders: Readonly<Record<string, () => Promise<TranslationSource>>> = {
    'da-DK': () => import('@integration-components/sdk-localization/translations/da-DK.json').then(({ default: source }) => source),
    'de-DE': () => import('@integration-components/sdk-localization/translations/de-DE.json').then(({ default: source }) => source),
    'es-ES': () => import('@integration-components/sdk-localization/translations/es-ES.json').then(({ default: source }) => source),
    'fi-FI': () => import('@integration-components/sdk-localization/translations/fi-FI.json').then(({ default: source }) => source),
    'fr-FR': () => import('@integration-components/sdk-localization/translations/fr-FR.json').then(({ default: source }) => source),
    'it-IT': () => import('@integration-components/sdk-localization/translations/it-IT.json').then(({ default: source }) => source),
    'nl-NL': () => import('@integration-components/sdk-localization/translations/nl-NL.json').then(({ default: source }) => source),
    'no-NO': () => import('@integration-components/sdk-localization/translations/no-NO.json').then(({ default: source }) => source),
    'pt-BR': () => import('@integration-components/sdk-localization/translations/pt-BR.json').then(({ default: source }) => source),
    'sv-SE': () => import('@integration-components/sdk-localization/translations/sv-SE.json').then(({ default: source }) => source),
};

/**
 * Loads the SDK-owned public copy for a locale. Locales are lazy-loaded like the V1 locale files;
 * `en-US` is available synchronously through {@link V2_SDK_DEFAULT_TRANSLATIONS}.
 */
export const loadV2SdkLocaleTranslations = async (locale: string): Promise<TranslationSource> => {
    const loader = localeLoaders[locale];
    return loader ? await loader() : {};
};

/**
 * SDK-owned Bento fallback copy, keyed by the exact universal Bento key. It backs Bento lookups
 * when the public-route candidates are absent (for keys the SDK overrides without a public
 * route, or when a routed public key has no copy in the requested source order). Consumer
 * custom translations on the public key always win.
 */
export const V2_SDK_BENTO_DEFAULT_TRANSLATIONS = bentoEnUs as TranslationSource;

const bentoLocaleLoaders: Readonly<Record<string, () => Promise<TranslationSource>>> = {
    'da-DK': () => import('@integration-components/sdk-localization/translations/bento/da-DK.json').then(({ default: source }) => source),
    'de-DE': () => import('@integration-components/sdk-localization/translations/bento/de-DE.json').then(({ default: source }) => source),
    'es-ES': () => import('@integration-components/sdk-localization/translations/bento/es-ES.json').then(({ default: source }) => source),
    'fi-FI': () => import('@integration-components/sdk-localization/translations/bento/fi-FI.json').then(({ default: source }) => source),
    'fr-FR': () => import('@integration-components/sdk-localization/translations/bento/fr-FR.json').then(({ default: source }) => source),
    'it-IT': () => import('@integration-components/sdk-localization/translations/bento/it-IT.json').then(({ default: source }) => source),
    'nl-NL': () => import('@integration-components/sdk-localization/translations/bento/nl-NL.json').then(({ default: source }) => source),
    'no-NO': () => import('@integration-components/sdk-localization/translations/bento/no-NO.json').then(({ default: source }) => source),
    'pt-BR': () => import('@integration-components/sdk-localization/translations/bento/pt-BR.json').then(({ default: source }) => source),
    'sv-SE': () => import('@integration-components/sdk-localization/translations/bento/sv-SE.json').then(({ default: source }) => source),
};

/**
 * Loads the SDK-owned Bento fallback copy for a locale; `en-US` is available synchronously
 * through {@link V2_SDK_BENTO_DEFAULT_TRANSLATIONS}.
 */
export const loadV2SdkBentoLocaleTranslations = async (locale: string): Promise<TranslationSource> => {
    const loader = bentoLocaleLoaders[locale];
    return loader ? await loader() : {};
};
