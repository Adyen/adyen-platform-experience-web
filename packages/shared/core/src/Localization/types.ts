import CURRENCY_CODES from './constants/currency-codes';
import CURRENCY_DECIMALS from './constants/currency-decimals';
import { SUPPORTED_LOCALES } from './constants/localization';
import type Localization from './Localization';
import type { TranslationKey, TranslationOptions } from '../translations';

export type CurrencyCode = keyof typeof CURRENCY_CODES;
export type CurrencyDecimalCode = keyof typeof CURRENCY_DECIMALS;

export type SupportedLocales = (typeof SUPPORTED_LOCALES)[number];

export type I18n = Omit<Localization['i18n'], 'get' | 'has'> & {
    get(key: TranslationKey, options?: TranslationOptions): string;
    has(key: string, options?: TranslationOptions): key is TranslationKey;
};
