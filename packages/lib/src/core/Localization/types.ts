import CURRENCY_CODES from './constants/currency-codes';
import CURRENCY_DECIMALS from './constants/currency-decimals';
import { SUPPORTED_LOCALES } from '../Localization/constants/localization';
import type { ReplaceUnderscoreOrDash } from '@src/utils/types';
import { en_US } from '@src/core';

export type CurrencyCode = keyof typeof CURRENCY_CODES;
export type CurrencyDecimalCode = keyof typeof CURRENCY_DECIMALS;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type SupportedLocaleFiles = ReplaceUnderscoreOrDash<SupportedLocale, '-', '_'>;

export type LangFile = {
    [K in SupportedLocaleFiles]: {
        [P in K]: Translation;
    };
}[SupportedLocaleFiles];

export type TranslationKey = keyof (typeof en_US)['en_US'];

export type TranslationOptions = {
    values?: Record<string, string | number>;
    count?: number;
};

export type Translation = {
    [message: string]: string;
};

export type CustomTranslations = {
    [key: string]: {
        [message in TranslationKey]?: string;
    };
};
