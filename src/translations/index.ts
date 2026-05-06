import type { KeyOfRecord } from '../utils/types';
import EN_US from '../assets/translations/en-US.json' with { type: 'json' };
const _en_US = { ...EN_US };

type _SupportedLocale = KeyOfRecord<typeof all_locales>;
type _Translations = Translations | PromiseLike<Translations>;

export type CustomTranslations = Record<string, Translations>;
export type Locale = `${Lowercase<string>}-${Uppercase<string>}`;
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

// TODO - Remove this in v2. It was previously used to expose the available translations to the user.
export const da_DK = { da_DK: () => ({}) };
export const de_DE = { de_DE: () => ({}) };
export const es_ES = { es_ES: () => ({}) };
export const fi_FI = { fi_FI: () => ({}) };
export const fr_FR = { fr_FR: () => ({}) };
export const it_IT = { it_IT: () => ({}) };
export const nl_NL = { nl_NL: () => ({}) };
export const no_NO = { no_NO: () => ({}) };
export const pt_BR = { pt_BR: () => ({}) };
export const sv_SE = { sv_SE: () => ({}) };

export const en_US = { en_US: _en_US as Translations };

// TODO - Remove this in v2. It was previously used to expose all the available translations to the user.
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
