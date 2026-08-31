import { CURRENCY_DECIMALS } from '@integration-components/utils';
import type { TransactionsI18n } from './types';

export const getCurrencyDivider = (currency: string): number => CURRENCY_DECIMALS[currency as keyof typeof CURRENCY_DECIMALS] ?? 100;

export const getDecimalAmount = (amount: number | string, currency: string): number =>
    Number.parseInt(String(amount), 10) / getCurrencyDivider(currency);

export const getCurrencyCode = (currency: string): string | undefined => {
    try {
        return new Intl.NumberFormat('en', { currency, currencyDisplay: 'symbol', style: 'currency' })
            .formatToParts(0)
            .find(part => part.type === 'currency')?.value;
    } catch {
        return undefined;
    }
};

export const formatDate = (i18n: TransactionsI18n, date: number | string | Date, options: Intl.DateTimeFormatOptions, timezone?: string): string => {
    try {
        const timeZone = timezone ? new Intl.DateTimeFormat('en', { timeZone: timezone }).resolvedOptions().timeZone : i18n.timezone;
        return i18n.date(date, { timeZone, ...options });
    } catch {
        return i18n.date(date, { timeZone: i18n.timezone, ...options });
    }
};

export const formatAmountWithCurrencyCode = (i18n: TransactionsI18n, amount: number, currency: string): string => {
    const localizedAmount = i18n.amount(Math.abs(amount), currency, { hideCurrency: true });
    return `${amount < 0 ? `- ${localizedAmount}` : localizedAmount} ${currency}`;
};

export const normalizeAmountInput = (
    rawValue: string | number,
    locale: string,
    currency: string,
    maxValue?: number
): { amount: number; displayValue: string; localeDecimalSeparator: string } => {
    let displayValue = String(rawValue).trim();
    const decimalSeparator = (1.1).toLocaleString(locale).match(/\d(.*?)\d/)?.[1] || '.';
    const exponent = Math.log10(getCurrencyDivider(currency));
    const parts = displayValue.split(decimalSeparator);

    if (parts.length === 2 && parts[1]!.length >= exponent) {
        displayValue = `${parts[0]}${decimalSeparator}${parts[1]!.substring(0, exponent)}`;
    }
    if (displayValue.endsWith(decimalSeparator)) displayValue = displayValue.slice(0, -decimalSeparator.length);

    const normalized = decimalSeparator === '.' ? displayValue : displayValue.replace(decimalSeparator, '.');
    const parsed = Number.parseFloat(normalized);
    if (maxValue !== undefined && Number.isFinite(parsed) && parsed > maxValue) {
        const fixed = maxValue.toFixed(exponent);
        displayValue = decimalSeparator === '.' ? fixed : fixed.replace('.', decimalSeparator);
    }

    const normalizedDisplay = decimalSeparator === '.' ? displayValue : displayValue.replace(decimalSeparator, '.');
    const amount = Math.trunc(+`${Number.parseFloat(normalizedDisplay)}e${exponent}`) || 0;
    return { amount, displayValue, localeDecimalSeparator: decimalSeparator };
};
