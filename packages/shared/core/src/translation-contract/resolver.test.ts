import { describe, expect, test, vi } from 'vitest';
import type { PublicTranslationAlias, PublicTranslationRoute } from './types';
import { TranslationContractResolver } from './resolver';

const routes = [
    {
        publicKey: 'reports.title',
        targets: [{ domain: 'reports', format: 'v1', key: 'local.title', kind: 'domain' }],
    },
    {
        publicKey: 'common.supportedTypes',
        targets: [
            { format: 'bento', key: 'bento.file.supportedTypes', kind: 'bento' },
            { domain: 'reports', format: 'v1', key: 'local.supportedTypes', kind: 'domain' },
        ],
    },
] as const satisfies readonly PublicTranslationRoute[];

const aliases = [
    {
        alias: 'reports.oldTitle',
        deprecated: true,
        targets: ['reports.title'],
    },
] as const satisfies readonly PublicTranslationAlias[];

const createResolver = (diagnosticReporter = vi.fn(), consumerTranslations: Record<string, Record<string, string>> | undefined = undefined) =>
    new TranslationContractResolver({
        aliases,
        diagnosticReporter,
        routes,
        sources: {
            consumerTranslations,
            sdkDefaultTranslations: {
                'common.supportedTypes': 'Supported types: %{list}',
                'reports.title': 'Reports',
            },
            sdkLocale: 'fr-FR',
            sdkLocaleTranslations: {
                'common.supportedTypes': 'Types pris en charge : %{list}',
                'reports.title': 'Rapports',
            },
        },
    });

describe('TranslationContractResolver', () => {
    test('returns independent default and exact-locale candidates', () => {
        const callback = createResolver().getCallback('reports');

        expect(callback('local.title', 'fr-FR')).toEqual({
            defaultTranslation: 'Reports',
            localeTranslation: 'Rapports',
        });
        expect(callback('local.title', 'fr-CA')).toEqual({
            defaultTranslation: 'Reports',
        });
        expect(callback('local.title', 'en-US')).toEqual({
            defaultTranslation: 'Reports',
            localeTranslation: 'Reports',
        });
    });

    test('applies direct values before aliases and SDK files', () => {
        const callback = createResolver(undefined, {
            'fr-FR': {
                'reports.oldTitle': 'Alias',
                'reports.title': 'Direct',
            },
            'en-US': {
                'reports.title': 'Custom default',
            },
        }).getCallback('reports');

        expect(callback('local.title', 'fr-FR')).toEqual({
            defaultTranslation: 'Custom default',
            localeTranslation: 'Direct',
        });
    });

    test('forwards consumer extension keys as SDK candidates without diagnostics', () => {
        const reporter = vi.fn();
        const callback = createResolver(reporter, {
            en_US: {
                storeLabel: 'Store',
            },
            'fr-FR': {
                storeLabel: 'Magasin',
            },
        }).getCallback('reports');

        expect(callback('storeLabel', 'en-US')).toEqual({
            defaultTranslation: 'Store',
            localeTranslation: 'Store',
        });
        expect(callback('storeLabel', 'fr-FR')).toEqual({
            defaultTranslation: 'Store',
            localeTranslation: 'Magasin',
        });
        expect(callback('storeLabel', 'fr-CA')).toEqual({
            defaultTranslation: 'Store',
        });
        expect(reporter).not.toHaveBeenCalled();
    });

    test('rejects Bento-shaped consumer keys with a sanitized diagnostic', () => {
        const reporter = vi.fn();
        const callback = createResolver(reporter, {
            'en-US': {
                'bento.alert.close': 'Close',
                'common.bento.alert.close': 'Close',
            },
        }).getCallback('reports');

        expect(callback('bento.alert.close', 'en-US')).toEqual({});
        expect(callback('common.bento.alert.close', 'en-US')).toEqual({});
        expect(reporter).toHaveBeenCalledWith({ code: 'unknown_translation_key' });
        expect(JSON.stringify(reporter.mock.calls)).not.toContain('bento.alert.close');
    });

    test('rejects extension templates that do not parse as public V1 templates', () => {
        const reporter = vi.fn();
        const callback = createResolver(reporter, {
            'en-US': {
                storeLabel: 'Unclosed %{placeholder',
            },
        }).getCallback('reports');

        expect(callback('storeLabel', 'en-US')).toEqual({});
        expect(reporter).toHaveBeenCalledWith({ code: 'invalid_translation_template' });
        expect(JSON.stringify(reporter.mock.calls)).not.toContain('storeLabel');
    });

    test('compiles public placeholders for each target format', () => {
        const callback = createResolver().getCallback('reports');

        expect(callback('bento.file.supportedTypes', 'fr-FR')).toEqual({
            defaultTranslation: 'Supported types: {list}',
            localeTranslation: 'Types pris en charge : {list}',
        });
        expect(callback('local.supportedTypes', 'fr-FR')).toEqual({
            defaultTranslation: 'Supported types: %{list}',
            localeTranslation: 'Types pris en charge : %{list}',
        });
    });

    test('ignores invalid public templates and reports sanitized diagnostics', () => {
        const reporter = vi.fn();
        const callback = createResolver(reporter, {
            'not a locale': { arbitrarySecretKey: 'private value' },
            'fr-FR': {
                arbitrarySecretKey: 'private value',
                'common.supportedTypes': 'Missing placeholder',
            },
        }).getCallback('reports');

        expect(callback('local.supportedTypes', 'fr-FR').localeTranslation).toBe('Types pris en charge : %{list}');
        expect(reporter).toHaveBeenCalledWith({ code: 'invalid_translation_locale' });
        expect(reporter).toHaveBeenCalledWith({ code: 'invalid_translation_template', publicKey: 'common.supportedTypes' });
        expect(JSON.stringify(reporter.mock.calls)).not.toContain('arbitrarySecretKey');
        expect(JSON.stringify(reporter.mock.calls)).not.toContain('private value');
    });

    test('rejects incompatible consumer placeholders using the contract when the SDK default is absent', () => {
        const reporter = vi.fn();
        const resolver = new TranslationContractResolver({
            diagnosticReporter: reporter,
            placeholderContracts: { 'reports.title': ['name'] },
            routes: [{ publicKey: 'reports.title', targets: [{ domain: 'reports', format: 'v1', key: 'local.title', kind: 'domain' }] }],
            sources: {
                consumerTranslations: { 'fr-FR': { 'reports.title': 'Rapports %{other}' } },
                sdkDefaultTranslations: {},
            },
        });

        expect(resolver.getCallback('reports')('local.title', 'fr-FR')).toEqual({});
        expect(reporter).toHaveBeenCalledWith({ code: 'invalid_translation_template', publicKey: 'reports.title' });
    });

    test('keeps callback identity stable until translation state changes', () => {
        const sources = {
            sdkDefaultTranslations: {
                'common.supportedTypes': 'Supported types: %{list}',
                'reports.title': 'Reports',
            },
            sdkLocale: 'fr-FR',
            sdkLocaleTranslations: {
                'common.supportedTypes': 'Types pris en charge : %{list}',
                'reports.title': 'Rapports',
            },
        };
        const resolver = new TranslationContractResolver({ aliases, routes, sources });
        const initial = resolver.getCallback('reports');

        expect(resolver.update(sources)).toBe(false);
        expect(resolver.getCallback('reports')).toBe(initial);

        resolver.update({
            sdkDefaultTranslations: { 'reports.title': 'Reports' },
            sdkLocale: 'de-DE',
            sdkLocaleTranslations: { 'reports.title': 'Berichte' },
        });

        expect(resolver.getCallback('reports')).not.toBe(initial);
    });

    test('diagnoses unknown local keys but treats unrouted Bento keys as intentional', () => {
        const reporter = vi.fn();
        const callback = createResolver(reporter).getCallback('reports');

        expect(callback('local.unknown', 'en-US')).toEqual({});
        expect(callback('bento.unrouted', 'en-US')).toEqual({});
        expect(reporter).toHaveBeenCalledTimes(1);
        expect(reporter).toHaveBeenCalledWith({ code: 'unmapped_domain_key', domain: 'reports' });
    });
});
