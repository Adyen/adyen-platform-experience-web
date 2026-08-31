import { describe, expect, test } from 'vitest';
import {
    compileTranslationFamily,
    compileTranslationTemplate,
    formatV1TranslationTemplate,
    InvalidTranslationTemplateError,
    parseTranslationFamilyKey,
    parseV1TranslationTemplate,
} from './message';

describe('V1 translation templates', () => {
    test('parses and compiles named placeholders through an AST', () => {
        const template = parseV1TranslationTemplate('Supported: %{list}. %{list}');

        expect(template.placeholders).toEqual(['list']);
        expect(compileTranslationTemplate(template, 'v1')).toBe('Supported: %{list}. %{list}');
        expect(compileTranslationTemplate(template, 'bento')).toBe('Supported: {list}. {list}');
        expect(formatV1TranslationTemplate(template, { list: 'PDF' })).toBe('Supported: PDF. PDF');
    });

    test('preserves placeholder callback indexes', () => {
        const template = parseV1TranslationTemplate('%{item}, %{other}, %{item}');
        const values = (placeholder: string, index: number, repetitionIndex: number) => `${placeholder}:${index}:${repetitionIndex}`;

        expect(formatV1TranslationTemplate(template, values)).toBe('item:0:0, other:1:0, item:2:1');
    });

    test.each(['%{}', '%{not-valid}', '%{open'])('rejects malformed placeholders in %s', source => {
        expect(() => parseV1TranslationTemplate(source)).toThrow(InvalidTranslationTemplateError);
    });
});

describe('translation families', () => {
    test.each([
        ['items', { baseKey: 'items', variant: { type: 'base' } }],
        ['items__plural', { baseKey: 'items', variant: { type: 'plural' } }],
        ['items__0', { baseKey: 'items', variant: { type: 'exact', count: 0 } }],
        ['items__many', { baseKey: 'items__many', variant: { type: 'base' } }],
    ])('parses %s', (key, expected) => {
        expect(parseTranslationFamilyKey(key)).toEqual(expected);
    });

    test('retains V1 family variants for a V1 target', () => {
        expect(
            compileTranslationFamily(
                {
                    base: '%{count} item',
                    plural: '%{count} items',
                    exact: { 0: 'No items' },
                },
                'v1'
            )
        ).toEqual({
            format: 'v1',
            templates: {
                base: '%{count} item',
                plural: '%{count} items',
                exact: { 0: 'No items' },
            },
        });
    });

    test('rejects V1 plural semantics that Bento cannot represent losslessly', () => {
        expect(() => compileTranslationFamily({ base: 'item', plural: 'items' }, 'bento')).toThrow(InvalidTranslationTemplateError);
    });
});
