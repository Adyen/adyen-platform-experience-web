import type { KeyOfRecord } from '@integration-components/utils/types';
import type { BentoTranslationKey } from '@adyen/bento-vue3/translation-keys';
import EN_US from '../../../../sdk/translations/en-US.json';

const _en_US = { ...EN_US };

export type CustomTranslations = Record<string, Translations>;
export type Locale = `${Lowercase<string>}-${Uppercase<string>}`;
export type TranslationKey = KeyOfRecord<typeof _en_US>;
export type Translations = { [key in TranslationKey]?: string };

/**
 * A key addressable in either catalog the runtime serves: the merged domain keyspace or the
 * Bento mirror. The Localization surface that both keyspaces share (getTemplate, has,
 * getTranslationFamily) accepts these; the domain-facing surface stays `TranslationKey` (or its
 * per-domain extract, `DomainTranslationKey`).
 */
export type AddressableTranslationKey = TranslationKey | BentoTranslationKey;

export type TranslationOptions = {
    values?: Record<string, any> | ((placeholder: string, index: number, repetitionIndex: number) => any);
    count?: number;
};

export type TranslationDomain = 'capital' | 'disputes' | 'payByLink' | 'payouts' | 'reports' | 'transactions';

export type DomainTranslationKey<D extends TranslationDomain = TranslationDomain> = Extract<TranslationKey, `${D}.${string}`>;
export type DomainCustomTranslations = Record<string, { [key in DomainTranslationKey]?: string }>;
export const getDomainTranslationKey = (domain: TranslationDomain, key: string): DomainTranslationKey => `${domain}.${key}` as DomainTranslationKey;

export const defaultTranslations: Translations = _en_US as Translations;
