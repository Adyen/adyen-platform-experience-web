import { describe, expect, test } from 'vitest';
import { getCurrencyDivider, getDecimalAmount, normalizeAmountInput } from './format';

describe('currency amount formatting', () => {
    test.each([
        ['IQD', 1000, '1.234', 1234],
        ['CVE', 1, '123', 123],
        ['GHC', 1, '123', 123],
        ['MRO', 10, '1.2', 12],
    ])('uses the SDK minor-unit precision for %s', (currency, divider, displayValue, amount) => {
        expect(getCurrencyDivider(currency)).toBe(divider);
        expect(getDecimalAmount(amount, currency)).toBe(amount / divider);
        expect(normalizeAmountInput(displayValue, 'en-US', currency)).toMatchObject({ amount, displayValue });
    });

    test('retains normal two-decimal amount formatting and normalization', () => {
        expect(getCurrencyDivider('USD')).toBe(100);
        expect(getDecimalAmount(1234, 'USD')).toBe(12.34);
        expect(normalizeAmountInput('12.345', 'en-US', 'USD')).toMatchObject({ amount: 1234, displayValue: '12.34' });
    });
});
