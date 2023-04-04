import CURRENCY_CODES, { CurrencyCode } from './constants/currency-codes';
import CURRENCY_DECIMALS, { CurrencyDecimalCode } from './constants/currency-decimals';

/**
 * @internal
 * @param currencyCode -
 * Get divider amount
 */
export const getDivider = (currencyCode: CurrencyCode): number => CURRENCY_DECIMALS[currencyCode as CurrencyDecimalCode] || 100;

/**
 * @internal
 * @param currencyCode -
 * Returns whether a CURRENCY CODE is valid
 */
export const isValidCurrencyCode = (currencyCode: CurrencyCode): boolean => !!CURRENCY_CODES[currencyCode];

/**
 * @internal
 */
export const getCurrencyCode = (currencyCode: CurrencyCode): string | null =>
    isValidCurrencyCode(currencyCode) ? CURRENCY_CODES[currencyCode] : null;

/**
 * @internal
 */
export const getDecimalAmount = (amount: number | string, currencyCode: CurrencyCode): number => {
    const divider = getDivider(currencyCode);
    return parseInt(String(amount), 10) / divider;
};

/**
 * @internal
 */
export const getLocalisedAmount = (amount: number, locale: string, currencyCode: CurrencyCode, options: Record<string, any> = {}): string => {
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
        return decimalAmount.toLocaleString(formattedLocale, localeOptions);
    } catch (e) {
        return stringAmount;
    }
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
