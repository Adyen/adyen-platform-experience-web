import { describe, expect, test, vi } from 'vitest';
import { CoreDomainTranslations } from './domainTranslations';
import { TranslationContractResolver } from './resolver';

describe('CoreDomainTranslations', () => {
    test('provides scoped translation inputs and signals callback or locale updates', () => {
        const resolver = new TranslationContractResolver({
            aliases: [],
            routes: [{ publicKey: 'reports.title', targets: [{ domain: 'reports', format: 'v1', key: 'title', kind: 'domain' }] }],
            sources: {
                sdkDefaultTranslations: { 'reports.title': 'Reports' },
            },
        });
        const domainTranslations = new CoreDomainTranslations({ locale: 'en-US', resolver });
        const controller = new AbortController();
        const connection = domainTranslations.connect('reports', controller.signal);
        const listener = vi.fn();
        const removeEventListener = vi.spyOn(controller.signal, 'removeEventListener');
        const unsubscribe = connection.translations.subscribe(listener);

        expect(connection.translations.getInputs()).toMatchObject({ locale: 'en-US' });
        expect(connection.translations.getInputs().getCustomTranslations?.('title', 'en-US')).toEqual({
            defaultTranslation: 'Reports',
            localeTranslation: 'Reports',
        });

        expect(domainTranslations.refresh('en-US')).toBe(false);
        resolver.update({
            sdkDefaultTranslations: { 'reports.title': 'Updated reports' },
        });
        expect(domainTranslations.refresh('en-US')).toBe(true);
        expect(listener).toHaveBeenCalledWith(expect.objectContaining({ locale: 'en-US' }));

        unsubscribe();
        expect(removeEventListener).toHaveBeenCalledWith('abort', expect.any(Function));
        controller.abort();
        domainTranslations.refresh('fi-FI');
        expect(listener).toHaveBeenCalledOnce();
    });

    test('isolates listeners for concurrent instances of the same domain', () => {
        const resolver = new TranslationContractResolver({
            aliases: [],
            routes: [],
            sources: { sdkDefaultTranslations: {} },
        });
        const domainTranslations = new CoreDomainTranslations({ locale: 'en-US', resolver });
        const first = domainTranslations.connect('reports', new AbortController().signal);
        const second = domainTranslations.connect('reports', new AbortController().signal);
        const firstListener = vi.fn();
        const secondListener = vi.fn();
        first.translations.subscribe(firstListener);
        second.translations.subscribe(secondListener);

        first.dispose();
        domainTranslations.refresh('fi-FI');

        expect(firstListener).not.toHaveBeenCalled();
        expect(secondListener).toHaveBeenCalledOnce();
    });

    test('keeps newer connections registered when an older connection is disposed again', () => {
        const resolver = new TranslationContractResolver({
            aliases: [],
            routes: [],
            sources: { sdkDefaultTranslations: {} },
        });
        const domainTranslations = new CoreDomainTranslations({ locale: 'en-US', resolver });
        const first = domainTranslations.connect('reports', new AbortController().signal);
        first.dispose();
        const second = domainTranslations.connect('reports', new AbortController().signal);
        const listener = vi.fn();
        second.translations.subscribe(listener);

        first.dispose();
        domainTranslations.refresh('fi-FI');

        expect(listener).toHaveBeenCalledOnce();
    });
});
