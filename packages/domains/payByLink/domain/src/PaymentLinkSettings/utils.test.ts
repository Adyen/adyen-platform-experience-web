import { describe, expect, test } from 'vitest';
import { isTermsAndConditionsData, isThemeData, isThemePayload, isValidURL } from './utils';

describe('PaymentLinkSettings utils', () => {
    test('identifies settings data by its fields', () => {
        expect(isTermsAndConditionsData({ termsOfServiceUrl: 'https://example.com/terms' })).toBe(true);
        expect(isTermsAndConditionsData({ brandName: 'Example' })).toBe(false);
        expect(isThemeData({ brandName: 'Example' })).toBe(true);
        expect(isThemeData({ termsOfServiceUrl: 'https://example.com/terms' })).toBe(false);
    });

    test('identifies FormData payloads', () => {
        expect(isThemePayload(new FormData())).toBe(true);
        expect(isThemePayload({ termsOfServiceUrl: 'https://example.com/terms' })).toBe(false);
    });

    test.each([
        ['', true],
        ['https://example.com/terms', true],
        ['not a URL', false],
    ])('validates URL "%s"', (url, expected) => {
        expect(isValidURL(url)).toBe(expected);
    });
});
