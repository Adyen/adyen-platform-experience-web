import { describe, expect, test } from 'vitest';
import { getDropdownValue } from './getDropdownValue';

describe('getDropdownValue', () => {
    test('should read the value, whether the dropdown reports the value or its option', () => {
        expect(getDropdownValue('BA1')).toBe('BA1');
        expect(getDropdownValue({ value: 'BA1' })).toBe('BA1');
        expect(getDropdownValue(1)).toBe('1');
        expect(getDropdownValue({ value: 1 })).toBe('1');
    });

    test('should give no value when the dropdown reports no single value', () => {
        expect(getDropdownValue(undefined)).toBeUndefined();
        expect(getDropdownValue(null)).toBeUndefined();
        expect(getDropdownValue({})).toBeUndefined();
        expect(getDropdownValue({ value: null })).toBeUndefined();
        expect(getDropdownValue(['BA1'])).toBeUndefined();
    });
});
