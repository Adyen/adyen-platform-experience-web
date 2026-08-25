import { CurrencyCode } from '../types';
import { isValidCurrencyCode, getCurrencyCode, getLocalisedAmount, getLocalisedPercentage, getDivider, normalizeAmountInput } from './amount-util';
import { beforeAll, afterEach, afterAll, describe, expect, test, vi, MockInstance } from 'vitest';

describe('isValidCurrencyCode', () => {
    // In the past this currency code was an exception, test that everything still works
    test('should return true for BYN', () => {
        expect(isValidCurrencyCode('BYN')).toBe(true);
    });

    test('should return true for existing keys', () => {
        expect(isValidCurrencyCode('USD')).toBe(true);
    });
});

describe('getDivider', () => {
    test('should return the divider for a currency', () => {
        expect(getDivider('USD')).toBe(100);
        expect(getDivider('JPY')).toBe(1);
        expect(getDivider('BHD')).toBe(1000);
        expect(getDivider('MRO' as CurrencyCode)).toBe(10);
    });
});

describe('normalizeAmountInput', () => {
    test('should trim decimals to the currency exponent and return minor units', () => {
        expect(normalizeAmountInput('123.456', 'en-US', 'EUR')).toEqual({
            displayValue: '123.45',
            amount: 12345,
            localeDecimalSeparator: '.',
        });
    });

    test('should clamp values above the maximum', () => {
        expect(normalizeAmountInput('100.01', 'en-US', 'EUR', 100)).toEqual({
            displayValue: '100.00',
            amount: 10000,
            localeDecimalSeparator: '.',
        });
    });

    test('should support localized decimal separators', () => {
        expect(normalizeAmountInput('100,01', 'de-DE', 'EUR', 100)).toEqual({
            displayValue: '100,00',
            amount: 10000,
            localeDecimalSeparator: ',',
        });
    });
});

describe('getCurrencyCode', () => {
    test('should return a currency symbol for existing keys', () => {
        expect(getCurrencyCode('USD')).toBe('$');
        expect(getCurrencyCode('BYN')).toBe('Br');
    });
});

describe('getLocalisedAmount', () => {
    let spyOnToLocaleString: MockInstance;

    beforeAll(() => {
        spyOnToLocaleString = vi.spyOn(Number.prototype, 'toLocaleString');
    });

    afterEach(() => {
        spyOnToLocaleString.mockClear();
    });

    afterAll(() => {
        spyOnToLocaleString.mockRestore();
    });

    test('should return a formatted EUR amount', () => {
        getLocalisedAmount(1000, 'nl-NL', 'EUR');
        expect(spyOnToLocaleString).toHaveBeenCalledWith('nl-NL', { currency: 'EUR', currencyDisplay: 'symbol', style: 'currency' });
    });

    test('should return a formatted USD amount', () => {
        getLocalisedAmount(1000, 'en-US', 'USD');
        expect(spyOnToLocaleString).toHaveBeenCalledWith('en-US', { currency: 'USD', currencyDisplay: 'symbol', style: 'currency' });
    });
});

describe('getLocalisedPercentage', () => {
    test('should return a percentage formatted string', () => {
        expect(getLocalisedPercentage(1000, 'en-US')).toBe('10%');
        expect(getLocalisedPercentage(100, 'en-US')).toBe('1%');
        expect(getLocalisedPercentage(10, 'en-US')).toBe('0.1%');
        expect(getLocalisedPercentage(1, 'en-US')).toBe('0.01%');
        expect(getLocalisedPercentage(1234, 'en-US')).toBe('12.34%');
        expect(getLocalisedPercentage(-2500, 'en-US')).toBe('-25%');
    });
});
