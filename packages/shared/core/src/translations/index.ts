import type { KeyOfRecord } from '@integration-components/utils/types';
import EN_US from '@integration-components/assets/translations/en-US.json' with { type: 'json' };

const _en_US = { ...EN_US };

export type CustomTranslations = Record<string, Translations>;
export type Locale = `${Lowercase<string>}-${Uppercase<string>}`;
export type TranslationKey = KeyOfRecord<typeof _en_US>;
export type Translations = { [key in TranslationKey]?: string };

export type TranslationOptions = {
    values?: Record<string, any> | ((placeholder: string, index: number, repetitionIndex: number) => any);
    count?: number;
};

export const defaultTranslations: Translations = _en_US as Translations;
