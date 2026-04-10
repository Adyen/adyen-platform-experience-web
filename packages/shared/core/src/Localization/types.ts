import CURRENCY_CODES from './constants/currency-codes';
import CURRENCY_DECIMALS from './constants/currency-decimals';
import { SUPPORTED_LOCALES } from './constants/localization';

export type CurrencyCode = keyof typeof CURRENCY_CODES;
export type CurrencyDecimalCode = keyof typeof CURRENCY_DECIMALS;

export type SupportedLocales = (typeof SUPPORTED_LOCALES)[number];
