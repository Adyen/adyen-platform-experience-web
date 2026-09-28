import type { KeyOfRecord } from '@integration-components/utils/types';
import EN_US from '../../../../sdk/translations/en-US.json';

const _en_US = { ...EN_US };

export type CustomTranslations = Record<string, Translations>;
export type Locale = `${Lowercase<string>}-${Uppercase<string>}`;
export type TranslationKey = KeyOfRecord<typeof _en_US>;
export type Translations = { [key in TranslationKey]?: string };

export type TranslationOptions = {
    values?: Record<string, any> | ((placeholder: string, index: number, repetitionIndex: number) => any);
    count?: number;
};

export type TranslationDomain = 'capital' | 'disputes' | 'payByLink' | 'payouts' | 'reports' | 'transactions';

export type DomainTranslationKey = Extract<TranslationKey, `${TranslationDomain}.${string}`>;
export type DomainCustomTranslations = Record<string, { [key in DomainTranslationKey]?: string }>;
export const getDomainTranslationKey = (domain: TranslationDomain, key: string): DomainTranslationKey => `${domain}.${key}` as DomainTranslationKey;

export const defaultTranslations: Translations = _en_US as Translations;
