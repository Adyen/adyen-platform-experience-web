/**
 * @vitest-environment jsdom
 */
import { describe, expect, test } from 'vitest';
import { wasSearched } from './wasSearched';

const dropdownWith = (value: string) => {
    const root = document.createElement('div');
    root.innerHTML = '<input role="combobox" />';
    root.querySelector('input')!.value = value;
    return root;
};

describe('wasSearched', () => {
    test('should tell an option chosen while the field holds what was typed', () => {
        expect(wasSearched(dropdownWith('sav'), 'Main account')).toBe(true);
        expect(wasSearched(dropdownWith('sav'), undefined)).toBe(true);
    });

    test('should not tell an option chosen without typing, the field holding nothing or what was selected', () => {
        expect(wasSearched(dropdownWith(''), 'Main account')).toBe(false);
        expect(wasSearched(dropdownWith('Main account'), 'Main account')).toBe(false);
        expect(wasSearched(dropdownWith('  '), undefined)).toBe(false);
    });

    test('should tell a search in a field that is the root of the dropdown', () => {
        const field = dropdownWith('sav').querySelector('input')!;

        expect(wasSearched(field, 'Main account')).toBe(true);
    });

    test('should not tell a search without a field', () => {
        expect(wasSearched(document.createElement('div'), 'Main account')).toBe(false);
        expect(wasSearched(undefined, 'Main account')).toBe(false);
    });
});
