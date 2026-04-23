import type { Translations } from './index';

const _getTranslations = (translationsPromise: Promise<{ default: Translations }>) =>
    translationsPromise.then(({ default: translations }) => translations);

export const da_DK = { 'da-DK': _getTranslations(import('../assets/translations/da-DK.json')) };
export const de_DE = { 'de-DE': _getTranslations(import('../assets/translations/de-DE.json')) };
export const es_ES = { 'es-ES': _getTranslations(import('../assets/translations/es-ES.json')) };
export const fi_FI = { 'fi-FI': _getTranslations(import('../assets/translations/fi-FI.json')) };
export const fr_FR = { 'fr-FR': _getTranslations(import('../assets/translations/fr-FR.json')) };
export const it_IT = { 'it-IT': _getTranslations(import('../assets/translations/it-IT.json')) };
export const nl_NL = { 'nl-NL': _getTranslations(import('../assets/translations/nl-NL.json')) };
export const no_NO = { 'no-NO': _getTranslations(import('../assets/translations/no-NO.json')) };
export const pt_BR = { 'pt-BR': _getTranslations(import('../assets/translations/pt-BR.json')) };
export const sv_SE = { 'sv-SE': _getTranslations(import('../assets/translations/sv-SE.json')) };
export const en_US = { 'en-US': _getTranslations(import('../assets/translations/en-US.json')) };

export const translations_dev_assets: Record<string, Promise<any>> = {
    ...da_DK,
    ...de_DE,
    ...en_US,
    ...es_ES,
    ...fi_FI,
    ...fr_FR,
    ...it_IT,
    ...nl_NL,
    ...no_NO,
    ...pt_BR,
    ...sv_SE,
};
