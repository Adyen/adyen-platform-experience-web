import type { KeyOfRecord, WithReplacedUnderscoreOrDash } from '../utils/types';
import EN_US from './en-US.json';
const _en_US = { ...EN_US };

type _SupportedLocale = KeyOfRecord<typeof all_locales>;
type _Translations = Translations | PromiseLike<Translations>;

export type CustomTranslations = Record<string, Translations>;
export type Locale = `${Lowercase<string>}-${Uppercase<string>}`;
export type SupportedLocale = WithReplacedUnderscoreOrDash<_SupportedLocale, '_', '-'>;
export type TranslationKey = KeyOfRecord<typeof _en_US>;
export type Translations = { [key in TranslationKey]?: string };
export type TranslationSource = _Translations | (() => _Translations);

export type TranslationSourceRecord = {
    [K in _SupportedLocale]: {
        [P in K]: TranslationSource;
    };
}[_SupportedLocale];

export type TranslationOptions = {
    values?: Record<string, any> | ((placeholder: string, index: number, repetitionIndex: number) => any);
    count?: number;
};

const _getTranslations = (translationsPromise: Promise<{ default: Translations }>) =>
    translationsPromise.then(({ default: translations }) => translations);

export const da_DK = { da_DK: () => _getTranslations(import('./da-DK.json')) };
export const de_DE = { de_DE: () => _getTranslations(import('./de-DE.json')) };
export const es_ES = { es_ES: () => _getTranslations(import('./es-ES.json')) };
export const fi_FI = { fi_FI: () => _getTranslations(import('./fi-FI.json')) };
export const fr_FR = { fr_FR: () => _getTranslations(import('./fr-FR.json')) };
export const it_IT = { it_IT: () => _getTranslations(import('./it-IT.json')) };
export const nl_NL = { nl_NL: () => _getTranslations(import('./nl-NL.json')) };
export const no_NO = { no_NO: () => _getTranslations(import('./no-NO.json')) };
export const pt_BR = { pt_BR: () => _getTranslations(import('./pt-BR.json')) };
export const sv_SE = { sv_SE: () => _getTranslations(import('./sv-SE.json')) };

export const en_US = { en_US: _en_US as Translations };

export const all_locales = {
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
} as const;
