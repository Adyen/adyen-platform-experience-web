import { describe, expect, test } from 'vitest';
import {
    compileBentoTemplate,
    compileDomainTemplateForBento,
    compileDomainTranslationFamilyForBento,
    InvalidBentoTranslationTemplateError,
} from './bentoTranslationTemplate';

describe('Bento translation template compiler', () => {
    test('compiles SDK placeholders to Vue I18n placeholders', () => {
        expect(compileBentoTemplate('Supported: %{list}. %{list}')).toBe('Supported: {list}. {list}');
    });

    test('rejects translations that mix SDK and Bento placeholder types', () => {
        expect(() => compileBentoTemplate('Page {page} of %{totalPages}')).toThrow(InvalidBentoTranslationTemplateError);
    });

    test('only compiles a domain template when its placeholders match Bento', () => {
        expect(compileDomainTemplateForBento('No results for %{filter}', 'No results for {filter}')).toBe('No results for {filter}');
        expect(compileDomainTemplateForBento('No results for %{query}', 'No results for {filter}')).toBeNull();
    });

    test('uses the general plural template when exact counts are unsupported', () => {
        expect(
            compileDomainTranslationFamilyForBento(
                {
                    base: '%{count} file',
                    zero: 'No files',
                    one: null,
                    plural: '%{count} files',
                    unsupportedExactCounts: [2],
                },
                '{count} files'
            )
        ).toBe('No files | {count} file | {count} files');
    });

    test('falls back when an unsupported exact count has no general plural template', () => {
        expect(
            compileDomainTranslationFamilyForBento(
                {
                    base: '%{count} file',
                    zero: null,
                    one: null,
                    plural: null,
                    unsupportedExactCounts: [2],
                },
                '{count} files'
            )
        ).toBeNull();
    });

    test.each(['%{}', '%{not-valid}', '%{open'])('rejects malformed SDK placeholders in %s', source => {
        expect(() => compileBentoTemplate(source)).toThrow(InvalidBentoTranslationTemplateError);
    });
});
