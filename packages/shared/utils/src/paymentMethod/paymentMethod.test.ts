import { describe, expect, test } from 'vitest';
import { parsePaymentMethodType } from './paymentMethod';

describe('parsePaymentMethodType', () => {
    describe('when lastFourDigits is present', () => {
        test('returns only the last four digits when no format is specified', () => {
            expect(parsePaymentMethodType({ type: 'visa', lastFourDigits: '1234' })).toBe('1234');
        });

        test('returns only the last four digits when format is "fourDigit"', () => {
            expect(parsePaymentMethodType({ type: 'visa', lastFourDigits: '1234' }, 'fourDigit')).toBe('1234');
        });

        test('returns masked card number when format is "detail"', () => {
            expect(parsePaymentMethodType({ type: 'visa', lastFourDigits: '1234' }, 'detail')).toBe('•••• •••• •••• 1234');
        });

        test('lastFourDigits takes precedence over description', () => {
            expect(parsePaymentMethodType({ type: 'visa', lastFourDigits: '5678', description: 'Visa' })).toBe('5678');
        });
    });

    describe('when lastFourDigits is absent', () => {
        test('returns description when present', () => {
            expect(parsePaymentMethodType({ type: 'visa', description: 'Visa' })).toBe('Visa');
        });

        test('returns mapped display name for known type "klarna"', () => {
            expect(parsePaymentMethodType({ type: 'klarna' })).toBe('Klarna');
        });

        test('returns mapped display name for known type "paypal"', () => {
            expect(parsePaymentMethodType({ type: 'paypal' })).toBe('PayPal');
        });

        test('returns mapped display name for known type "klarna_paynow"', () => {
            expect(parsePaymentMethodType({ type: 'klarna_paynow' })).toBe('Klarna Pay Now');
        });

        test('description takes precedence over mapped type name', () => {
            expect(parsePaymentMethodType({ type: 'klarna', description: 'Custom Klarna' })).toBe('Custom Klarna');
        });

        test('falls back to the raw type value for unknown types', () => {
            expect(parsePaymentMethodType({ type: 'mc' })).toBe('mc');
        });

        test('falls back to the raw type value when description is empty string', () => {
            expect(parsePaymentMethodType({ type: 'mc', description: '' })).toBe('mc');
        });
    });
});
