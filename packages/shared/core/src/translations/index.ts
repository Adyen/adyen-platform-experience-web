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

/** The domains in `D` that do not define the domain-relative key `R`. */
type DomainsMissingKey<D extends TranslationDomain, R extends string> = {
    [K in D]: `${K}.${R}` extends TranslationKey ? never : K;
}[D];

/**
 * `R` when every domain in `D` defines it, otherwise a type that names the domains that do not.
 * The name surfaces in the compiler error, so the offending domain is visible at the call site.
 */
type DefinedInDomain<D extends TranslationDomain, R extends string> = [DomainsMissingKey<D, R>] extends [never]
    ? R
    : { 'translation key missing from these domains': DomainsMissingKey<D, R> };

/**
 * For keys composed from a domain that is only known at runtime, which therefore
 * have to exist in all of them.
 */
export type DefinedInEveryDomain<R extends string> = DefinedInDomain<TranslationDomain, R>;

/**
 * Builds an absolute translation key from a domain and a domain-relative key, and fails to compile
 * unless every domain the call could be made with defines that key. `i18n.get` renders the raw key
 * when it is missing, so an unchecked composition surfaces as key text in the UI.
 *
 * The strictness follows what the caller knows: passing a domain from `useCoreContext` checks all
 * six, while passing a literal domain checks only that one.
 */
export const getSafeDomainTranslationKey = <D extends TranslationDomain, R extends string>(
    domain: D,
    key: R & DefinedInDomain<D, R>
): DomainTranslationKey<D> => `${domain}.${key}` as DomainTranslationKey<D>;

/**
 * Builds the key without checking that it exists. Only for lookups that are expected to miss, where
 * the caller handles the absence; `getSafeDomainTranslationKey` is correct everywhere else.
 */
export const getUnsafeDomainTranslationKey = (domain: TranslationDomain, key: string): DomainTranslationKey =>
    `${domain}.${key}` as DomainTranslationKey;

export const defaultTranslations: Translations = _en_US as Translations;
