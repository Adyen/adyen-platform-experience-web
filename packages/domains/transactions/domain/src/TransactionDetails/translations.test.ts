import { describe, expect, test } from 'vitest';
import Localization from '@integration-components/core/Localization';
import {
    getTransactionAmountAdjustmentType,
    getTransactionAmountAdjustmentTypeInformation,
    getTransactionCategory,
    getTransactionCategoryDescription,
    getTransactionRefundReason,
} from './translations';

// These factories assemble their key from a prefix (and sometimes a suffix)
// around the raw API value, so a catalog rename cannot be caught by type
// checking: the key simply stops resolving and the summary renders the API
// value instead of the copy.
const i18n = new Localization().i18n;

describe('getTransactionAmountAdjustmentType', () => {
    test('resolves the copy of an adjustment type', () => {
        expect(getTransactionAmountAdjustmentType(i18n, 'surcharge')).toBe('Surcharge amount');
        expect(getTransactionAmountAdjustmentType(i18n, 'tip')).toBe('Tip amount');
    });

    test('falls back to the raw value for an unknown adjustment type', () => {
        expect(getTransactionAmountAdjustmentType(i18n, 'brandNewType')).toBe('brandNewType');
    });
});

describe('getTransactionAmountAdjustmentTypeInformation', () => {
    test('resolves the detail sentence filed under the adjustment', () => {
        expect(getTransactionAmountAdjustmentTypeInformation(i18n, 'surcharge')).toBe('Surcharge credited to another account.');
        expect(getTransactionAmountAdjustmentTypeInformation(i18n, 'tip')).toBe('Tip credited to another account.');
    });

    test('has no fallback for an adjustment type without a detail sentence', () => {
        expect(getTransactionAmountAdjustmentTypeInformation(i18n, 'fee')).toBeUndefined();
    });
});

describe('getTransactionCategory', () => {
    test('resolves a category and its description', () => {
        expect(getTransactionCategory(i18n, 'Payment')).toBe('Payment');
        expect(getTransactionCategoryDescription(i18n, 'Payment')).toBeDefined();
    });
});

describe('getTransactionRefundReason', () => {
    test('resolves a known refund reason through the enum map', () => {
        expect(getTransactionRefundReason(i18n, 'requested_by_customer')).toBe('Requested by customer');
    });

    test('resolves a refund reason that arrives already in key form', () => {
        expect(getTransactionRefundReason(i18n, 'requestedByCustomer')).toBe('Requested by customer');
    });
});
