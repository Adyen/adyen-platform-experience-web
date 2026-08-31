import { describe, expect, test, vi } from 'vitest';
import { createDomainTranslations } from './createDomainTranslations';
import type { CoreInstance } from './types';
import type { DomainTranslationInputs } from '../translation-contract';

vi.mock('@adyen/bento-vue3', () => ({
    useBentoTranslationOverrides: vi.fn(),
}));

vi.mock('vue-i18n', () => ({
    createI18n: ({ locale }: { locale: string }) => ({
        global: { locale: { value: locale } },
        install: vi.fn(),
    }),
}));

type Listener = (inputs: DomainTranslationInputs<string>) => void;

/**
 * Mirrors the notification semantics of CoreDomainTranslations: getInputs() is a live
 * poll, subscribe() does not replay the current inputs, and only already-subscribed
 * listeners are notified when inputs change.
 */
const createFakeCore = () => {
    const listeners = new Set<Listener>();
    let locale: string | undefined = 'en-US';
    const getInputs = (): DomainTranslationInputs<string> => ({ locale });
    const core = {
        i18n: {
            amount: vi.fn(),
            date: vi.fn(),
            fullDate: vi.fn(),
            ready: true,
            timezone: 'UTC',
        },
        connectDomainTranslations: () => ({
            dispose: vi.fn(),
            translations: {
                getInputs,
                subscribe: (listener: Listener) => {
                    listeners.add(listener);
                    return () => listeners.delete(listener);
                },
            },
        }),
    } as unknown as CoreInstance;

    return {
        core,
        changeLocale(next: string) {
            locale = next;
            for (const listener of [...listeners]) listener(getInputs());
        },
    };
};

describe('createDomainTranslations', () => {
    test('applies locale changes that happen while the initial source is loading', async () => {
        const { core, changeLocale } = createFakeCore();
        let resolveEnSource!: (source: Record<string, string>) => void;
        const loaders = {
            'en-US': () =>
                new Promise<Record<string, string>>(resolve => {
                    resolveEnSource = resolve;
                }),
            'nl-NL': () => Promise.resolve({ 'overview.title': 'Paymentlinks' }),
        };

        const pending = createDomainTranslations({
            core,
            domain: 'payByLink',
            loaders,
            protectedKeys: new Set<never>(),
            signal: new AbortController().signal,
            source: {},
        });

        // The host switches locale during the async gap before subscribe() is registered.
        changeLocale('nl-NL');
        resolveEnSource({ 'overview.title': 'Payment links' });

        const { translations } = await pending;
        await vi.waitFor(() => expect(translations.i18n.locale).toBe('nl-NL'));
    });

    test('uses the initial locale when inputs do not change', async () => {
        const { core } = createFakeCore();
        const { translations, dispose } = await createDomainTranslations({
            core,
            domain: 'payByLink',
            loaders: { 'en-US': () => Promise.resolve({ 'overview.title': 'Payment links' }) },
            protectedKeys: new Set<never>(),
            signal: new AbortController().signal,
            source: {},
        });

        expect(translations.i18n.locale).toBe('en-US');
        dispose();
    });

    test('syncs locale changes that arrive after subscribing', async () => {
        const { core, changeLocale } = createFakeCore();
        const { translations, dispose } = await createDomainTranslations({
            core,
            domain: 'payByLink',
            loaders: {
                'en-US': () => Promise.resolve({ 'overview.title': 'Payment links' }),
                'nl-NL': () => Promise.resolve({ 'overview.title': 'Paymentlinks' }),
            },
            protectedKeys: new Set<never>(),
            signal: new AbortController().signal,
            source: {},
        });

        expect(translations.i18n.locale).toBe('en-US');

        changeLocale('nl-NL');
        await vi.waitFor(() => expect(translations.i18n.locale).toBe('nl-NL'));

        dispose();
    });
});
