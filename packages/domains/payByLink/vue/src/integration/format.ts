const getCurrencyFractionDigits = (currency: string): number => {
    try {
        return new Intl.NumberFormat('en', { currency, style: 'currency' }).resolvedOptions().maximumFractionDigits ?? 2;
    } catch {
        return 2;
    }
};

const getCurrencyDivider = (currency: string): number => 10 ** getCurrencyFractionDigits(currency);

export const formatAmount = (amount: number, currency: string): string =>
    (amount / getCurrencyDivider(currency)).toFixed(getCurrencyFractionDigits(currency));

export const normalizeAmountInput = (
    rawValue: string | number,
    locale: string,
    currency: string,
    maxValue?: number
): { amount: number; displayValue: string; localeDecimalSeparator: string } => {
    let displayValue = String(rawValue).trim();
    const decimalSeparator = (1.1).toLocaleString(locale).match(/\d(.*?)\d/)?.[1] || '.';
    const exponent = getCurrencyFractionDigits(currency);
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
