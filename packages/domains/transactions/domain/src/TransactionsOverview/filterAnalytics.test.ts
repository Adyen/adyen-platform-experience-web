import { describe, expect, test } from 'vitest';
import { getFilterAnalyticsValue } from './filterAnalytics';

describe('getFilterAnalyticsValue', () => {
    test('does not disclose a PSP reference in analytics', () => {
        expect(getFilterAnalyticsValue('paymentPspReference', 'PSP0000000000056')).toBeNull();
    });

    test('formats multiple selected values as a single property', () => {
        expect(getFilterAnalyticsValue('currencies', ['EUR', 'USD'])).toBe('EUR,USD');
    });

    test('preserves other filter values', () => {
        expect(getFilterAnalyticsValue('balanceAccountId', 'BA123')).toBe('BA123');
    });
});
