import { describe, expect, test, vi } from 'vitest';
import { createDomainI18n } from './domainI18n';

type Key = 'items' | 'items__plural' | 'legal' | 'title';

describe('DomainLocalization', () => {
    test('applies the four-value fallback order before interpolation', () => {
        const getCustomTranslations = vi.fn((key: Key, locale: string) => ({
            defaultTranslation: key === 'title' ? 'SDK default %{name}' : undefined,
            localeTranslation: locale === 'fr-CA' && key === 'title' ? 'SDK locale %{name}' : undefined,
        }));
        const i18n = createDomainI18n<Key>({
            inputs: { getCustomTranslations, locale: 'fr-CA' },
            localSources: { 'fr-CA': { title: 'Local locale %{name}' } },
            source: { title: 'Local default %{name}' },
        });

        expect(i18n.get('title', { values: { name: 'Ada' } })).toBe('SDK locale Ada');

        i18n.update({
            getCustomTranslations: key => ({ defaultTranslation: key === 'title' ? 'SDK default %{name}' : undefined }),
            locale: 'fr-CA',
        });
        expect(i18n.get('title', { values: { name: 'Ada' } })).toBe('Local locale Ada');

        i18n.update({
            getCustomTranslations: key => ({ defaultTranslation: key === 'title' ? 'SDK default %{name}' : undefined }),
            locale: 'de-DE',
        });
        expect(i18n.get('title', { values: { name: 'Ada' } })).toBe('SDK default Ada');

        i18n.update({ locale: 'de-DE' });
        expect(i18n.get('title', { values: { name: 'Ada' } })).toBe('Local default Ada');
    });

    test('selects local plural variants before requesting an SDK candidate', () => {
        const getCustomTranslations = vi.fn(() => ({}));
        const i18n = createDomainI18n<Key>({
            inputs: { getCustomTranslations, locale: 'en-US' },
            source: {
                items: '%{count} item',
                items__plural: '%{count} items',
            },
        });

        expect(i18n.get('items', { count: 3, values: { count: 3 } })).toBe('3 items');
        expect(getCustomTranslations).toHaveBeenCalledWith('items__plural', 'en-US');
    });

    test('keeps protected and local-only paths out of the SDK callback', () => {
        const getCustomTranslations = vi.fn(() => ({ localeTranslation: 'SDK' }));
        const i18n = createDomainI18n<Key>({
            inputs: { getCustomTranslations, locale: 'en-US' },
            protectedKeys: new Set(['legal']),
            source: { legal: 'Local legal', title: 'Local title' },
        });

        expect(i18n.get('legal')).toBe('Local legal');
        expect(i18n.resolveLocalTemplate('title')).toBe('Local title');
        expect(getCustomTranslations).not.toHaveBeenCalled();
    });

    test('requests exact unsupported locales and reacts to locale or callback changes', () => {
        const initial = vi.fn(() => ({ localeTranslation: 'Finnish' }));
        const next = vi.fn(() => ({ localeTranslation: 'Updated Finnish' }));
        const i18n = createDomainI18n<Key>({
            inputs: { getCustomTranslations: initial, locale: 'fi-FI' },
            source: { title: 'Reports' },
        });

        expect(i18n.get('title')).toBe('Finnish');
        expect(initial).toHaveBeenCalledWith('title', 'fi-FI');
        expect(i18n.update({ getCustomTranslations: next, locale: 'fi-FI' })).toBe(true);
        expect(i18n.get('title')).toBe('Updated Finnish');
        expect(i18n.update({ getCustomTranslations: next, locale: 'fi-FI' })).toBe(false);
    });
});
