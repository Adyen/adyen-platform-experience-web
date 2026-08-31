import { describe, expect, test } from 'vitest';
import type { TranslationContractRegistry } from './types';
import { validateTranslationContract } from './validate';

const registry = {
    aliases: [],
    domains: ['reports'],
    routes: [
        {
            publicKey: 'reports.overview.title',
            targets: [{ domain: 'reports', format: 'v1', key: 'reports.overview.title', kind: 'domain' }],
        },
        {
            publicKey: 'common.actions.dismiss.labels.close',
            targets: [{ format: 'bento', key: 'bento.alert.close', kind: 'bento' }],
        },
    ],
} as const satisfies TranslationContractRegistry;

const validInput = {
    bentoKeys: new Set(['bento.alert.close']),
    domainSources: { reports: { 'reports.overview.title': 'Reports' } },
    publicTemplates: {
        'common.actions.dismiss.labels.close': 'Close',
        'reports.overview.title': 'Reports',
    },
    registry,
};

describe('validateTranslationContract', () => {
    test('accepts complete explicit domain and universal routes', () => {
        expect(validateTranslationContract(validInput)).toEqual([]);
    });

    test('reports missing, stale, duplicate, and unsupported targets', () => {
        const invalidRegistry = {
            ...registry,
            routes: [
                ...registry.routes,
                {
                    publicKey: 'reports.stale',
                    targets: [{ domain: 'reports', format: 'v1', key: 'reports.stale', kind: 'domain' }],
                },
                {
                    publicKey: 'common.actions.closeAgain',
                    targets: [{ format: 'bento', key: 'bento.alert.close', kind: 'bento' }],
                },
                {
                    publicKey: 'common.actions.unknown',
                    targets: [{ format: 'bento', key: 'bento.unknown', kind: 'bento' }],
                },
            ],
        } as const satisfies TranslationContractRegistry;

        const diagnostics = validateTranslationContract({
            ...validInput,
            domainSources: { reports: { 'reports.overview.missing': 'Missing' } },
            registry: invalidRegistry,
        });

        expect(diagnostics.map(({ code }) => code)).toEqual(
            expect.arrayContaining([
                'duplicate_translation_route',
                'missing_translation_route',
                'stale_translation_route',
                'unsupported_translation_target',
            ])
        );
    });

    test('rejects non-public namespaces and incompatible placeholders', () => {
        const diagnostics = validateTranslationContract({
            ...validInput,
            domainSources: { reports: { 'reports.overview.title': 'Reports %{name}' } },
            registry: {
                ...registry,
                routes: [
                    {
                        publicKey: 'bento.alert.close',
                        targets: [{ format: 'bento', key: 'bento.alert.close', kind: 'bento' }],
                    },
                    {
                        publicKey: 'reports.overview.title',
                        targets: [{ domain: 'reports', format: 'v1', key: 'reports.overview.title', kind: 'domain' }],
                    },
                ],
            },
        });

        expect(diagnostics.map(({ code }) => code)).toEqual(expect.arrayContaining(['invalid_translation_key', 'invalid_translation_template']));
    });

    test('uses a domain target as the placeholder contract when the SDK default is absent', () => {
        const diagnostics = validateTranslationContract({
            bentoKeys: new Set(),
            domainSources: {
                payouts: { 'payouts.title': 'Payouts %{id}' },
                reports: { 'reports.overview.title': 'Reports %{name}' },
            },
            publicTemplates: {},
            registry: {
                aliases: [],
                domains: ['payouts', 'reports'],
                routes: [
                    {
                        publicKey: 'reports.overview.title',
                        targets: [
                            { domain: 'reports', format: 'v1', key: 'reports.overview.title', kind: 'domain' },
                            { domain: 'payouts', format: 'v1', key: 'payouts.title', kind: 'domain' },
                        ],
                    },
                ],
            },
        });

        expect(diagnostics).toContainEqual({
            code: 'invalid_translation_template',
            domain: 'payouts',
            publicKey: 'reports.overview.title',
            targetKey: 'payouts.title',
        });
    });

    test('rejects Bento namespaces from the public key space', () => {
        const diagnostics = validateTranslationContract({
            ...validInput,
            registry: {
                ...registry,
                routes: [
                    {
                        publicKey: 'common.bento.alert.close',
                        targets: [{ format: 'bento', key: 'bento.alert.close', kind: 'bento' }],
                    },
                ],
            },
        });

        expect(diagnostics).toContainEqual(
            expect.objectContaining({
                code: 'invalid_translation_key',
                publicKey: 'common.bento.alert.close',
            })
        );
    });

    test('validates aliases without retaining arbitrary unknown values in diagnostics', () => {
        const diagnostics = validateTranslationContract({
            ...validInput,
            registry: {
                ...registry,
                aliases: [{ alias: 'raw-local-key', targets: ['missing.public.key'] }],
            },
        });

        expect(diagnostics).toContainEqual({ code: 'invalid_translation_alias' });
        expect(JSON.stringify(diagnostics)).not.toContain('raw-local-key');
        expect(JSON.stringify(diagnostics)).not.toContain('missing.public.key');
    });
});
