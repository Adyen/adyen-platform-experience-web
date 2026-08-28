import { describe, expect, test } from 'vitest';
import { hasCustomField } from './hasCustomField';

describe('hasCustomField', () => {
    test('should count hidden custom fields by default', () => {
        expect(hasCustomField([{ key: '_hidden', visibility: 'hidden' }])).toBe(true);
    });

    test('should ignore hidden custom fields when requested', () => {
        expect(hasCustomField([{ key: '_hidden', visibility: 'hidden' }], [], { ignoreHiddenFields: true })).toBe(false);
        expect(hasCustomField([{ key: '_visible', visibility: 'visible' }])).toBe(true);
    });
});
