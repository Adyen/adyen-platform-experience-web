import CURRENCY_CODES from '../constants/currency-codes';
import CURRENCY_DECIMALS from '../constants/currency-decimals';
import { CurrencyCode, CurrencyDecimalCode } from '../types';

/**
 * @internal
 * @param currencyCode -
 * Get divider amount
 */
export const getDivider = (currencyCode: string): number => CURRENCY_DECIMALS[currencyCode as CurrencyDecimalCode] || 100;

/**
 * @internal
 * @param currencyCode -
 * Returns whether a CURRENCY CODE is valid
 */
export const isValidCurrencyCode = (currencyCode: string): currencyCode is CurrencyCode => !!CURRENCY_CODES[currencyCode as CurrencyCode];

/**
 * @internal
 */
export const getCurrencyCode = (currencyCode: string): string | null => (isValidCurrencyCode(currencyCode) ? CURRENCY_CODES[currencyCode] : null);

/**
 * @internal
 */
export const getDecimalAmount = (amount: number | string, currencyCode: string): number => {
    const divider = getDivider(currencyCode);
    return parseInt(String(amount), 10) / divider;
};

/**
 * @internal
 */
export const getLocalisedAmount = (
    amount: number,
    locale: string,
    currencyCode: string,
    hideSymbol = false,
    options: Intl.NumberFormatOptions = {}
): string => {
    const stringAmount = amount.toString(); // Changing amount to string to avoid 0-value from returning false

    const decimalAmount = getDecimalAmount(stringAmount, currencyCode);
    const formattedLocale = locale.replace('_', '-');

    const localeOptions = {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: 'symbol',
        ...options,
    };

    try {
        if (hideSymbol) return showCurrencyWithoutSymbol({ amount: decimalAmount, currencyCode, locale: formattedLocale });
        return decimalAmount.toLocaleString(formattedLocale, localeOptions);
    } catch (e) {
        return stringAmount;
    }
};

export const showCurrencyWithoutSymbol = ({ locale, amount, currencyCode }: { locale: string; amount: number; currencyCode: string }) => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode, currencyDisplay: 'symbol' })
        .formatToParts(amount)
        .filter(p => p.type !== 'currency')
        .reduce((s, p) => s + p.value, '')
        .trim();
};

/**
 * @internal
 */
export const getLocalisedPercentage = (percent = 0, locale: string): string | null => {
    const decimalPercent = percent / 100 / 100;
    const localeOptions = {
        style: 'percent',
        maximumFractionDigits: 2,
    };

    try {
        return decimalPercent.toLocaleString(locale, localeOptions);
    } catch (e) {
        return null;
    }
};
