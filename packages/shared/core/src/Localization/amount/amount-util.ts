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

export const getCurrencyExponent = (currencyCode: string): number => Math.log10(getDivider(currencyCode));

export const formatAmount = (amount: number, currencyCode: string): string =>
    getDecimalAmount(amount, currencyCode).toFixed(getCurrencyExponent(currencyCode));

export const normalizeAmountInput = (
    rawValue: string | number,
    locale: string,
    currencyCode: string,
    maxValue?: number
): { displayValue: string; amount: number; localeDecimalSeparator: string } => {
    let displayValue = String(rawValue).trim();
    const decimalSeparator = (1.1).toLocaleString(locale).match(/\d(.*?)\d/)?.[1] || '.';
    const exponent = getCurrencyExponent(currencyCode);
    const parts = displayValue.split(decimalSeparator);

    if (parts.length === 2 && parts[1]!.length >= exponent) {
        displayValue = `${parts[0]}${decimalSeparator}${parts[1]!.substring(0, exponent)}`;
    }

    if (displayValue.endsWith(decimalSeparator)) {
        displayValue = displayValue.slice(0, -decimalSeparator.length);
    }

    const normalizedValue = decimalSeparator === '.' ? displayValue : displayValue.replace(decimalSeparator, '.');
    const parsedValue = Number.parseFloat(normalizedValue);

    if (maxValue !== undefined && Number.isFinite(parsedValue) && parsedValue > maxValue) {
        const fixedValue = maxValue.toFixed(exponent);
        displayValue = decimalSeparator === '.' ? fixedValue : fixedValue.replace('.', decimalSeparator);
    }

    const normalizedDisplayValue = decimalSeparator === '.' ? displayValue : displayValue.replace(decimalSeparator, '.');
    const amount = Math.trunc(+`${Number.parseFloat(normalizedDisplayValue)}e${exponent}`) || 0;

    return { displayValue, amount, localeDecimalSeparator: decimalSeparator };
};

/**
 * @internal
 */
export const getLocalisedAmount = (
    amount: number,
    locale: string,
    currencyCode: string,
    hideCurrency = false,
    options: Intl.NumberFormatOptions = {}
): string => {
    const stringAmount = amount.toString(); // Changing amount to string to avoid 0-value from returning false
    const decimalAmount = getDecimalAmount(stringAmount, currencyCode);

    const formatterLocale = locale.replace('_', '-');
    const formatterOptions = {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: 'symbol',
        ...options,
    } as const;

    try {
        return hideCurrency
            ? formatAmountWithoutCurrency(formatterLocale, formatterOptions, decimalAmount)
            : decimalAmount.toLocaleString(formatterLocale, formatterOptions);
    } catch {
        return stringAmount;
    }
};

export const formatAmountWithoutCurrency = (locale: string, options: Intl.NumberFormatOptions, amount: number) => {
    return Intl.NumberFormat(locale, options)
        .formatToParts(amount)
        .filter(p => p.type !== 'currency')
        .reduce((s, p) => s + p.value, '')
        .trim();
};

export const formatAmountWithCurrencyCode = (amount: number, locale: string, currencyCode: string): string => {
    const localisedAmount = getLocalisedAmount(Math.abs(amount), locale, currencyCode, true, { currencyDisplay: 'symbol' });
    return `${amount < 0 ? `- ${localisedAmount}` : localisedAmount} ${currencyCode}`;
};

/**
 * @internal
 */
export const getLocalisedPercentage = (percent = 0, locale: string): string | null => {
    const decimalPercent = percent / 100 / 100;
    const localeOptions = {
        style: 'percent',
        maximumFractionDigits: 2,
    } as const;

    try {
        return decimalPercent.toLocaleString(locale, localeOptions);
    } catch {
        return null;
    }
};
