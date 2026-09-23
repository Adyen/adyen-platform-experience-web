import { describe, expect, test } from 'vitest';
import { getStoreDropdownDisplayValue } from './storeDropdown';

describe('getStoreDropdownDisplayValue', () => {
    test('returns description when present', () => {
        expect(getStoreDropdownDisplayValue('NY001', 'Main Store - New York')).toBe('Main Store - New York');
    });

    test('falls back to store code when description is undefined', () => {
        expect(getStoreDropdownDisplayValue('NY001', undefined)).toBe('NY001');
    });

    test('falls back to store code when description is empty string', () => {
        expect(getStoreDropdownDisplayValue('NY001', '')).toBe('NY001');
    });

    test('falls back to store code when description contains only whitespace', () => {
        expect(getStoreDropdownDisplayValue('NY001', '   ')).toBe('NY001');
    });
});
