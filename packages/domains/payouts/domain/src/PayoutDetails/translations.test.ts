import { describe, expect, test } from 'vitest';
import Localization from '@integration-components/core/Localization';
import { getPayoutAdjustmentType, getPayoutFundsCapturedType } from './translations';

// These factories assemble their key from a prefix and the raw API value, so a
// catalog rename cannot be caught by type checking: the key simply stops
// resolving and the breakdown renders the API value instead of the copy.
const i18n = new Localization().i18n;

describe('getPayoutAdjustmentType', () => {
    test('resolves the copy of an adjustment type', () => {
        expect(getPayoutAdjustmentType(i18n, 'fee')).toBe('Fees');
        expect(getPayoutAdjustmentType(i18n, 'grantRepayment')).toBe('Grant repayments');
    });

    test('falls back to the raw value for an unknown adjustment type', () => {
        expect(getPayoutAdjustmentType(i18n, 'brandNewType')).toBe('brandNewType');
    });
});

describe('getPayoutFundsCapturedType', () => {
    test('resolves the copy of a funds captured type', () => {
        expect(getPayoutFundsCapturedType(i18n, 'capture')).toBe('Captured');
    });
});
