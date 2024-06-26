import CURRENCY_CODES from './constants/currency-codes';
import CURRENCY_DECIMALS from './constants/currency-decimals';
import { SUPPORTED_LOCALES } from './constants/localization';
import type { WithReplacedUnderscoreOrDash } from '../../utils/types';
import { en_US } from '../../core';

export type CurrencyCode = keyof typeof CURRENCY_CODES;
export type CurrencyDecimalCode = keyof typeof CURRENCY_DECIMALS;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type SupportedLocaleFiles = WithReplacedUnderscoreOrDash<SupportedLocale, '-', '_'>;

export type LangFile = {
    [K in SupportedLocaleFiles]: {
        [P in K]: Translations;
    };
}[SupportedLocaleFiles];

export type TranslationKey = keyof (typeof en_US)['en_US'];

export type TranslationOptions = {
    values?: Record<string, string | number>;
    count?: number;
};

export type Translations = {
    [key in TranslationKey]?: string;
};

export type CustomTranslations = Record<string, Translations>;
